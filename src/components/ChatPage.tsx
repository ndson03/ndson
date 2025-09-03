"use client";

import React, { useState, useEffect, useMemo } from "react";
import ApiKeyForm from "../components/ApiKeyForm";
import { StorageService } from "../services/storageService";
import { ApiService } from "../services/apiService";
import { useApiKey } from "../hooks/useApiKey";
import { useScrollToBottom } from "../hooks/useScrollToBottom";
import { highlightCodeBlocks } from "../utils/codeHighlight";
import { handleApiError } from "../utils/errorHandler";
import { MESSAGES } from "../constants";
import { Message } from "../types";
import { ErrorBoundary } from "./ErrorBoundary";
import { DeletePopup } from "./DeletePopup";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import WelcomeMessage from "./WelcomeMessage";
import toast from "react-hot-toast";

export default function ChatPageWrapper() {
  return (
    <ErrorBoundary>
      <ChatPage />
    </ErrorBoundary>
  );
}

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteButtonElement, setDeleteButtonElement] =
    useState<HTMLElement | null>(null);
  const [storageService] = useState(() => new StorageService());
  const [isWelcome, setIsWelcome] = useState(false);
  const [inputRef, setInputRef] = useState<HTMLTextAreaElement | null>(null);

  const { apiKey, isReady: isApiKeyReady, setKey: setApiKey } = useApiKey();
  const { containerRef, scrollToBottom } = useScrollToBottom();

  // Initialize storage and load messages
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await storageService.initialize();
        const loadedMessages = await storageService.loadMessages();

        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        } else {
          setMessages([]);
          setIsWelcome(true);
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setMessages([]);
        setIsWelcome(true);
      }
    };

    initializeApp();
  }, [storageService]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Highlight code blocks for bot messages
  useEffect(() => {
    if (!containerRef.current || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage.isUser) {
        if (containerRef.current) {
          highlightCodeBlocks(containerRef.current);
        }
    }
  }, [messages]);

  // Event handlers
  const handleSendMessage = async () => {
    if (!isApiKeyReady || !apiKey.trim()) {
      alert(MESSAGES.API_KEY_REQUIRED);
      return;
    }

    const question = input.trim();
    if (!question || isLoading) return;

    // Add user message
    const userMessage: Message = {
      isUser: true,
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsWelcome(false);

    // Add loading message
    const loadingMessage: Message = {
      isUser: false,
      content: MESSAGES.TYPING,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, loadingMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = await storageService.buildApiHistory();
      const response = await ApiService.sendMessage({
        question,
        chatHistory,
        apiKey,
      });

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          content: response,
        };
        return newMessages;
      });

      await storageService.saveMessage(true, question);
      await storageService.saveMessage(false, response);
    } catch (error) {
      const errorMessage = handleApiError(error);

      setInput(question);
      setMessages((prev) => [...prev].slice(0, -2));

      if (messages.length == 0) {
        setIsWelcome(true);
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await storageService.clearMessages();
      setMessages([]);
      setIsWelcome(true);
      setShowDeletePopup(false);

      // Focus vào input sau khi clear history
      setTimeout(() => {
        if (inputRef && isApiKeyReady) {
          inputRef.focus();
        }
      }, 100);
    } catch (error) {
      alert(MESSAGES.DELETE_ERROR);
      setShowDeletePopup(false);
    }
  };

  // Memoized values
  const placeholderText = useMemo(() => {
    return isApiKeyReady
      ? "Hỏi bất kỳ điều gì"
      : "Vui lòng cấu hình API key để bắt đầu chat";
  }, [isApiKeyReady]);

  const renderedMessages = useMemo(() => {
    return messages.map((message, index) => (
      <ChatMessage
        key={`${index}-${message.timestamp}`}
        message={message}
        index={index}
      />
    ));
  }, [messages]);

  return (
    <div className="main-content">
      {isWelcome && <WelcomeMessage />}
      <ApiKeyForm
        onApiKeySet={setApiKey}
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />

      <DeletePopup
        isOpen={showDeletePopup}
        onConfirm={handleClearHistory}
        onCancel={() => setShowDeletePopup(false)}
        targetElement={deleteButtonElement}
      />

      <div className="container-fluid">
        <div className="chat-container">
          <div className="chat-box" ref={containerRef}>
            {renderedMessages}
          </div>

          <ChatInput
            input={input}
            onInputChange={setInput}
            onSendMessage={handleSendMessage}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            onApiKeyConfig={() => setShowApiKeyModal(true)}
            onDeleteHistory={(e) => {
              setDeleteButtonElement(e.currentTarget as HTMLElement);
              setShowDeletePopup(true);
            }}
            isApiKeyReady={isApiKeyReady}
            isLoading={isLoading}
            placeholder={placeholderText}
            isWelcome={isWelcome}
            setInputRef={setInputRef}
          />
        </div>
      </div>
    </div>
  );
}
