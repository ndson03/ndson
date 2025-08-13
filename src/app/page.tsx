"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import "highlight.js/styles/github.css";
import hljs from "highlight.js";
import ApiKeyForm from "../component/ApiKeyForm";

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
  const [apiKey, setApiKey] = useState("");
  const [isApiKeyReady, setIsApiKeyReady] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isDBInitialized, setIsDBInitialized] = useState(false);
  
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageCountRef = useRef(0);

  // Initialize IndexedDB - chỉ chạy 1 lần
  const initDB = useCallback((): Promise<IDBDatabase> => {
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
  }, []);

  // Save message to IndexedDB - tối ưu với useCallback
  const saveMessageToHistory = useCallback((isUser: boolean, content: string) => {
    if (!db) return;

    const transaction = db.transaction([STORE_NAME], "readwrite");
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
  }, []);

  // Clean up old messages - tối ưu với useCallback
  const cleanupOldMessages = useCallback(() => {
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
  }, []);

  // Load chat history - tối ưu với useCallback
  const loadChatHistory = useCallback(() => {
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
        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        } else {
          const welcomeMessage: Message = {
            isUser: false,
            content: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
            timestamp: new Date().toISOString(),
          };
          setMessages([welcomeMessage]);
        }
      }
    };

    request.onerror = () => {
      console.error("Failed to load chat history");
      const welcomeMessage: Message = {
        isUser: false,
        content: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    };
  }, []);

  // Build chat history for API - tối ưu với useCallback
  const buildChatHistoryForAPI = useCallback((): Promise<ApiMessage[]> => {
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

  // Clear chat history - tối ưu với useCallback
  const clearChatHistory = useCallback(() => {
    if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat không?")) {
      return;
    }

    if (!db) return;

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
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
  }, []);

  // Handle API Key - tối ưu với useCallback
  const handleApiKeySet = useCallback((key: string) => {
    setApiKey(key);
    setIsApiKeyReady(key.trim() !== "");
  }, []);

  // Handle key config button - tối ưu với useCallback
  const handleKeyConfigButtonClick = useCallback(() => {
    setShowApiKeyModal(true);
  }, []);

  // Copy code to clipboard - tối ưu với useCallback
  const copyCodeToClipboard = useCallback(async (code: string, button: HTMLElement) => {
    try {
      await navigator.clipboard.writeText(code);
      
      button.textContent = 'Đã sao chép';
      
      setTimeout(() => {
        button.textContent = 'Sao chép';
      }, 2000);
      
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Không thể sao chép code!");
    }
  }, []);

  // Detect language - tối ưu với useCallback
  const detectLanguage = useCallback((codeElement: HTMLElement): string => {
    const classList = codeElement.className;
    const languageMatch = classList.match(/(?:language-|hljs-)([a-zA-Z0-9+#-]+)/);
    return languageMatch ? languageMatch[1] : 'code';
  }, []);

  // Add copy buttons to code blocks - tối ưu để tránh re-process
  const addCopyButtonsToCodeBlocks = useCallback(() => {
    if (!chatBoxRef.current) return;

    const codeBlocks = chatBoxRef.current.querySelectorAll("pre code:not(.processed)");
    
    codeBlocks.forEach((block) => {
      const pre = block.parentElement;
      if (pre && !pre.classList.contains('code-block-processed')) {
        // Đánh dấu đã xử lý
        pre.classList.add('code-block-processed');
        (block as HTMLElement).classList.add('processed');
        
        const language = detectLanguage(block as HTMLElement);

        const codeHeader = document.createElement('div');
        codeHeader.className = 'code-header';
        
        const languageLabel = document.createElement('span');
        languageLabel.className = 'language-label';
        languageLabel.textContent = language;
        
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Sao chép';
        copyButton.title = 'Sao chép code';
        
        copyButton.addEventListener('click', () => {
          const codeText = (block as HTMLElement).textContent || '';
          copyCodeToClipboard(codeText, copyButton);
        });

        codeHeader.appendChild(languageLabel);
        codeHeader.appendChild(copyButton);

        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        
        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(codeHeader);
        wrapper.appendChild(pre);
        
        pre.style.margin = '0';
        pre.style.borderRadius = '0 0 8px 8px';
      }
    });
  }, [detectLanguage, copyCodeToClipboard]);

  // Auto-resize textarea - tối ưu với useCallback
  const autoResize = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const contentHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(contentHeight, 400);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, []);

  // Scroll to bottom - tối ưu với useCallback
  const scrollToBottom = useCallback(() => {
    if (!chatBoxRef.current) return;

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
  }, []);

  // Display user message - tối ưu với useCallback
  const displayUserMessage = useCallback((text: string) => {
    const newMessage: Message = {
      isUser: true,
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    saveMessageToHistory(true, text);
  }, [saveMessageToHistory]);

  // Ask question - tối ưu với useCallback
  const askQuestion = useCallback(async () => {
    if (!isApiKeyReady || !apiKey.trim()) {
      alert("Vui lòng cấu hình API key trước khi sử dụng!");
      return;
    }

    const question = input.trim();
    if (!question || isLoading) return;

    displayUserMessage(question);

    const loadingMessage: Message = {
      isUser: false,
      content: "typing...",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, loadingMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = await buildChatHistoryForAPI();
      const payload = {
        question,
        chatHistory,
        apiKey,
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

      saveMessageToHistory(false, responseText);
    } catch (error) {
      const errorMessage = `Có lỗi xảy ra: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;

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

      saveMessageToHistory(false, errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isApiKeyReady, apiKey, displayUserMessage, buildChatHistoryForAPI, saveMessageToHistory]);

  // Handle keyboard events - tối ưu với useCallback
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  }, [askQuestion]);

  // Handle input change - tối ưu với useCallback
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Delay auto-resize để tránh blocking UI
    requestAnimationFrame(() => {
      autoResize();
    });
  }, [autoResize]);

  // Close modal handler - tối ưu với useCallback
  const handleCloseModal = useCallback(() => {
    setShowApiKeyModal(false);
  }, []);

  // Render user message with preserved line breaks and indentation
  const renderUserMessage = useCallback((content: string) => {
    // Sử dụng white-space: pre-wrap để giữ nguyên khoảng trắng, tab và xuống dòng
    return (
      <div 
        className="user-message-text" 
        style={{ 
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          fontFamily: 'inherit'
        }}
      >
        {content}
      </div>
    );
  }, []);

  // Render message - tối ưu với useCallback và tránh re-render
  const renderMessage = useCallback((message: Message, index: number) => {
    if (message.isUser) {
      return (
        <div key={`${index}-${message.timestamp}`} className="user-message-container">
          {renderUserMessage(message.content)}
        </div>
      );
    }

    const isTyping = message.content === "typing...";

    return (
      <div
        key={`${index}-${message.timestamp}`}
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
              className="markdown-content"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked(message.content) as string, {
                  ALLOWED_TAGS: [
                    'p', 'br', 'strong', 'em', 'u', 'strike', 'code', 'pre',
                    'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
                  ],
                  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class']
                }),
              }}
            />
          )}
        </div>
      </div>
    );
  }, [renderUserMessage]);

  // Memoize rendered messages để tránh re-render khi gõ input
  const renderedMessages = useMemo(() => {
    return messages.map(renderMessage);
  }, [messages, renderMessage]);

  // Initialize DB - chỉ chạy 1 lần khi component mount
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await initDB();
        if (isMounted) {
          setIsDBInitialized(true);
        }
      } catch (error) {
        console.error("Failed to initialize IndexedDB:", error);
        if (isMounted) {
          const welcomeMessage: Message = {
            isUser: false,
            content: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
            timestamp: new Date().toISOString(),
          };
          setMessages([welcomeMessage]);
          setIsDBInitialized(true);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [initDB]);

  // Load chat history khi DB đã khởi tạo
  useEffect(() => {
    if (isDBInitialized) {
      loadChatHistory();
    }
  }, [isDBInitialized, loadChatHistory]);

  // Auto-scroll khi có tin nhắn mới - tối ưu để chỉ chạy khi thực sự cần
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      lastMessageCountRef.current = messages.length;
      // Delay scroll để đảm bảo DOM đã render xong
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages.length, scrollToBottom]);

  // Highlight code blocks - tối ưu để chỉ chạy khi có tin nhắn bot mới
  useEffect(() => {
    if (!chatBoxRef.current || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage.isUser && lastMessage.content !== "typing...") {
      // Delay để đảm bảo DOM đã render
      const timeoutId = setTimeout(() => {
        if (chatBoxRef.current) {
          const newCodeBlocks = chatBoxRef.current.querySelectorAll("pre code:not(.highlighted)");
          
          newCodeBlocks.forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
            (block as HTMLElement).classList.add('highlighted');
          });
          
          addCopyButtonsToCodeBlocks();
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [messages, addCopyButtonsToCodeBlocks]);

  // Memoize placeholder text
  const placeholderText = useMemo(() => {
    return isApiKeyReady
      ? "Hỏi bất kỳ điều gì"
      : "Vui lòng cấu hình API key để bắt đầu chat";
  }, [isApiKeyReady]);

  // Memoize button title
  const sendButtonTitle = useMemo(() => {
    return !isApiKeyReady ? "Vui lòng cấu hình API key" : "Gửi câu hỏi";
  }, [isApiKeyReady]);

  // Memoize send button disabled state
  const isSendButtonDisabled = useMemo(() => {
    return isLoading || !isApiKeyReady;
  }, [isLoading, isApiKeyReady]);

  return (
    <div className="main-content">
      <ApiKeyForm 
        onApiKeySet={handleApiKeySet} 
        isOpen={showApiKeyModal}
        onClose={handleCloseModal}
      />

      <div className="container-fluid">
        <div className="chat-container">
          <div className="chat-box" id="chatBox" ref={chatBoxRef}>
            {renderedMessages}
          </div>

          <div className="chat-input-container">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholderText}
              autoFocus={isApiKeyReady}
              disabled={!isApiKeyReady}
              className={`questionInput ${!isApiKeyReady ? "disabled" : ""}`}
            />
            <div className="button-container">
              <div className="left-buttons">
                <div
                  className="apikey-config-button"
                  onClick={handleKeyConfigButtonClick}
                  title="Cấu hình API Key"
                >
                  <i className="fa-solid fa-key"></i>
                </div>
              </div>
              <div className="right-buttons">
                <div
                  className={`send-button ${isSendButtonDisabled ? "disabled" : ""}`}
                  onClick={askQuestion}
                  title={sendButtonTitle}
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