import { useState, useCallback, useRef } from "react";
import { Message, ApiMessage } from "../types";

const DB_NAME = "ChatDB";
const DB_VERSION = 1;
const STORE_NAME = "chatHistory";

export const useIndexedDB = () => {
  const [isDBInitialized, setIsDBInitialized] = useState(false);
  const dbRef = useRef<IDBDatabase | null>(null);

  const initDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        dbRef.current = request.result;
        resolve(dbRef.current);
      };

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;

        if (!database.objectStoreNames.contains(STORE_NAME)) {
          const store = database.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }, []);

  const saveMessageToHistory = useCallback(
    (isUser: boolean, content: string) => {
      if (!dbRef.current) return;

      const transaction = dbRef.current.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const message: Message = {
        isUser,
        content,
        timestamp: new Date().toISOString(),
      };

      store.add(message);

      transaction.oncomplete = () => {
        cleanupOldMessages();
      };

      transaction.onerror = () => {
        console.error("Failed to save message to history");
      };
    },
    []
  );

  const cleanupOldMessages = useCallback(() => {
    if (!dbRef.current) return;

    const transaction = dbRef.current.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("timestamp");

    const request = index.openCursor(null, "prev");
    let count = 0;
    const maxMessages = 50;

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        count++;
        if (count > maxMessages) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }, []);

  const loadChatHistory = useCallback((): Promise<Message[]> => {
    return new Promise((resolve) => {
      if (!dbRef.current) {
        resolve([]);
        return;
      }

      const transaction = dbRef.current.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("timestamp");
      const request = index.openCursor(null, "next");

      const loadedMessages: Message[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          loadedMessages.push(cursor.value);
          cursor.continue();
        } else {
          resolve(loadedMessages);
        }
      };

      request.onerror = () => {
        console.error("Failed to load chat history");
        resolve([]);
      };
    });
  }, []);

  const buildChatHistoryForAPI = useCallback((): Promise<ApiMessage[]> => {
    return new Promise((resolve) => {
      if (!dbRef.current) {
        resolve([]);
        return;
      }

      const transaction = dbRef.current.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("timestamp");
      const request = index.openCursor(null, "next");

      const apiHistory: ApiMessage[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const message = cursor.value;
          let textContent = message.content;

          if (typeof textContent === "object" && textContent?.text) {
            textContent = textContent.text;
          }

          if (message.isUser) {
            apiHistory.push({
              role: "user",
              parts: [{ text: textContent }],
            });
          } else {
            apiHistory.push({
              role: "model",
              parts: [{ text: textContent }],
            });
          }
          cursor.continue();
        } else {
          resolve(apiHistory);
        }
      };

      request.onerror = () => {
        console.error("Failed to build chat history for API");
        resolve([]);
      };
    });
  }, []);

  const clearChatHistory = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!dbRef.current) {
        resolve(false);
        return;
      }

      const transaction = dbRef.current.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }, []);

  return {
    isDBInitialized,
    setIsDBInitialized,
    initDB,
    saveMessageToHistory,
    loadChatHistory,
    buildChatHistoryForAPI,
    clearChatHistory,
  };
};
