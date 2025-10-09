import { DB_CONFIG } from "../constants";
import { ApiMessage, Message } from "../types";

export class StorageService {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_CONFIG.NAME, DB_CONFIG.VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;

        if (!database.objectStoreNames.contains(DB_CONFIG.STORE_NAME)) {
          const store = database.createObjectStore(DB_CONFIG.STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  async saveMessage(isUser: boolean, content: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [DB_CONFIG.STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(DB_CONFIG.STORE_NAME);

      const message: Message = {
        isUser,
        content,
        timestamp: new Date().toISOString(),
      };

      const request = store.add(message);

      request.onsuccess = () => {
        this.cleanupOldMessages();
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  async loadMessages(): Promise<Message[]> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [DB_CONFIG.STORE_NAME],
        "readonly"
      );
      const store = transaction.objectStore(DB_CONFIG.STORE_NAME);
      const index = store.index("timestamp");
      const request = index.openCursor(null, "next");

      const messages: Message[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          messages.push(cursor.value);
          cursor.continue();
        } else {
          resolve(messages);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async buildApiHistory(): Promise<ApiMessage[]> {
    const messages = await this.loadMessages();

    return messages.map((message) => {
      let textContent: any = message.content;
      if (typeof textContent === "object" && textContent?.text) {
        textContent = textContent.text;
      }

      return {
        role: message.isUser ? ("user" as const) : ("model" as const),
        parts: [{ text: textContent }],
      };
    });
  }

  async clearMessages(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [DB_CONFIG.STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(DB_CONFIG.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private cleanupOldMessages(): void {
    if (!this.db) return;

    const transaction = this.db.transaction(
      [DB_CONFIG.STORE_NAME],
      "readwrite"
    );
    const store = transaction.objectStore(DB_CONFIG.STORE_NAME);
    const index = store.index("timestamp");

    const request = index.openCursor(null, "prev");
    let count = 0;

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        count++;
        if (count > DB_CONFIG.MAX_MESSAGES) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }
}
