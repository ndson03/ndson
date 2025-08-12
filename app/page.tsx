"use client";

import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import "highlight.js/styles/github.css";
import hljs from "highlight.js";

interface Message {
  id?: number;
  isUser: boolean;
  content: string;
  timestamp: string;
}

interface ApiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

// IndexedDB Configuration
const DB_NAME = "ChatDB";
const DB_VERSION = 1;
const STORE_NAME = "chatHistory";

let db: IDBDatabase | null = null;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize IndexedDB
  const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        db = request.result;
        resolve(db);
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
  };

  // Save message to IndexedDB
  const saveMessageToHistory = (isUser: boolean, content: string) => {
    if (!db) return;

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const message: Message = {
      isUser,
      content,
      timestamp: new Date().toISOString(),
    };

    const request = store.add(message);

    transaction.oncomplete = () => {
      cleanupOldMessages();
    };
  };

  // Clean up old messages (keep only last 50)
  const cleanupOldMessages = () => {
    if (!db) return;

    const transaction = db.transaction([STORE_NAME], "readwrite");
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
  };

  // Load chat history from IndexedDB
  const loadChatHistory = () => {
    if (!db) return;

    const transaction = db.transaction([STORE_NAME], "readonly");
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
        displayChatHistory(loadedMessages);
      }
    };
  };

  // Display chat history
  const displayChatHistory = (loadedMessages: Message[]) => {
    if (loadedMessages.length > 0) {
      setMessages(loadedMessages);
    } else {
      // Show welcome message if no history
      const welcomeMessage: Message = {
        isUser: false,
        content: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  };

  // Build chat history for API
  const buildChatHistoryForAPI = (): Promise<ApiMessage[]> => {
    return new Promise((resolve) => {
      if (!db) {
        resolve([]);
        return;
      }

      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("timestamp");
      const request = index.openCursor(null, "next");

      const apiHistory: ApiMessage[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const message = cursor.value;

          let textContent = message.content;
          if (typeof textContent === "object" && textContent.text) {
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
        resolve([]);
      };
    });
  };

  // Clear all chat history
  const clearChatHistory = () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat không?")) {
      if (!db) return;

      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        // Reset to welcome message
        const welcomeMessage: Message = {
          isUser: false,
          content: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      };

      request.onerror = () => {
        alert("Có lỗi xảy ra khi xóa lịch sử chat!");
      };
    }
  };

  // Initialize on component mount
  useEffect(() => {
    const init = async () => {
      try {
        await initDB();
        loadChatHistory();
      } catch (error) {
        console.error("Failed to initialize IndexedDB:", error);
        // Fallback to welcome message
        const welcomeMessage: Message = {
          isUser: false,
          content: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      }
    };

    init();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Highlight code blocks when messages update
  useEffect(() => {
    if (chatBoxRef.current) {
      const codeBlocks = chatBoxRef.current.querySelectorAll("pre code");
      codeBlocks.forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  });

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      const botMessages = chatBoxRef.current.querySelectorAll(".bot-message");
      const lastBotMessage = botMessages[botMessages.length - 1];

      if (lastBotMessage) {
        lastBotMessage.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        chatBoxRef.current.scrollTo({
          top: chatBoxRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const contentHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(contentHeight, 400);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const displayUserMessage = (text: string) => {
    const newMessage: Message = {
      isUser: true,
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    saveMessageToHistory(true, text);
  };

  const askQuestion = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    // Display user message
    displayUserMessage(question);

    // Add loading message
    const loadingMessage: Message = {
      isUser: false,
      content: "typing...",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, loadingMessage]);

    // Clear input and set loading state
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = await buildChatHistoryForAPI();
      const payload = {
        question,
        chatHistory,
      };

      const response = await fetch("https://ndson.vercel.app/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.json();

      // Update loading message with response
      setMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages.length > 0) {
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: responseText,
          };
        }
        return newMessages;
      });

      // Save response to history
      saveMessageToHistory(false, responseText);
    } catch (error) {
      const errorMessage = `Có lỗi xảy ra: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;

      // Update loading message with error
      setMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages.length > 0) {
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: errorMessage,
          };
        }
        return newMessages;
      });

      // Save error to history
      saveMessageToHistory(false, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    autoResize();
  };

  const renderMessage = (message: Message, index: number) => {
    if (message.isUser) {
      return (
        <div key={index} className="user-message-container">
          <div className="user-message-text">{message.content}</div>
        </div>
      );
    }

    const isTyping = message.content === "typing...";

    return (
      <div
        key={index}
        className={`bot-message ${isTyping ? "loading-message" : ""}`}
      >
        <div className="message-content">
          {isTyping ? (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked(message.content) as string),
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="main-content">
      <div className="container-fluid">
        <div className="chat-container">
          <div className="chat-box" id="chatBox" ref={chatBoxRef}>
            {messages.map(renderMessage)}
          </div>

          <div className="chat-input-container">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi bất kỳ điều gì"
              autoFocus
              className="questionInput"
            />
            <div className="button-container">
              <div className="right-buttons">
                <div
                  className={`send-button ${isLoading ? "disabled" : ""}`}
                  onClick={askQuestion}
                  title="Gửi câu hỏi"
                >
                  <i className="fas fa-arrow-up"></i>
                </div>
                <div
                  className="clear-button"
                  onClick={clearChatHistory}
                  title="Xóa lịch sử chat"
                >
                  <i className="fas fa-trash-alt"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
