"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import toast from "react-hot-toast";

import { useApiKey } from "../hooks/use-api-key";
import { useScrollToBottom } from "../hooks/use-scroll-to-bottom";
import { useIndexedDB } from "../hooks/use-indexed-db";
import { useChat } from "../hooks/use-chat";
import { useModelSelector } from "../hooks/use-model-selector";
import { useThinkingToggle } from "../hooks/use-thinking-toggle";
import { handleApiError } from "../utils/error-handler";
import { MESSAGES } from "../constants";

import { ChatMessage } from "../components/message/chat-message";
import WelcomeMessage from "../components/message/welcom-message";
import ApiKeyForm from "../components/api-key-form/api-key-form";
import { DeletePopup } from "../components/chat-input/delete-chat-history-popup";
import { ChatInput } from "../components/chat-input/chat-input";
import { LoadingMessage } from "../components/message/loading-message";
import { ScrollToBottomButton } from "../components/button/scroll-to-bottom-button";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteButtonElement, setDeleteButtonElement] =
    useState<HTMLElement | null>(null);
  const [isWelcome, setIsWelcome] = useState(false);
  const [inputRef, setInputRef] = useState<HTMLTextAreaElement | null>(null);

  const isInitialLoad = useRef(true);

  const { apiKey, isReady: isApiKeyReady, setKey: setApiKey } = useApiKey();
  const { selectedModelId, selectedModel, models, handleModelSelect } =
    useModelSelector();

  const { isThinking, toggleThinking } = useThinkingToggle(selectedModelId);
  const { containerRef, scrollToBottom, showScrollButton } =
    useScrollToBottom();

  const {
    isDBInitialized,
    saveMessageToHistory,
    loadChatHistory,
    buildChatHistoryForAPI,
    clearChatHistory,
  } = useIndexedDB();

  const { messages, isLoading, sendMessage, clearMessages, setMessages } =
    useChat({
      buildChatHistoryForAPI,
      saveMessageToHistory,
      selectedModel: selectedModelId,
      apiKey,
      isThinking,
    });

  // Initialize and load messages
  useEffect(() => {
    const initializeApp = async () => {
      if (!isDBInitialized) return;

      try {
        const loadedMessages = await loadChatHistory();
        setMessages(loadedMessages);
        setIsWelcome(loadedMessages.length === 0);
      } catch (error) {
        console.error("Failed to load chat history:", error);
        setMessages([]);
        setIsWelcome(true);
      }
    };

    initializeApp();
  }, [isDBInitialized, loadChatHistory, setMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0) {
      scrollToBottom(220);
      isInitialLoad.current = false;
    } else {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  const handleSendMessage = useCallback(async () => {
    if (!isApiKeyReady || !apiKey.trim()) {
      alert(MESSAGES.API_KEY_REQUIRED);
      return;
    }

    const question = input.trim();
    if (!question || isLoading) return;

    setInput("");
    setIsWelcome(false);

    try {
      await sendMessage(question);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      setInput(question);

      if (messages.length === 0) {
        setIsWelcome(true);
      }

      toast.error(errorMessage);
    }
  }, [isApiKeyReady, apiKey, input, isLoading, sendMessage, messages.length]);

  // Handle clear history
  const handleClearHistory = useCallback(async () => {
    try {
      const success = await clearChatHistory();

      if (success) {
        clearMessages();
        setIsWelcome(true);
        setShowDeletePopup(false);
        isInitialLoad.current = true;

        setTimeout(() => {
          if (inputRef && isApiKeyReady) {
            inputRef.focus();
          }
        }, 100);
      } else {
        alert(MESSAGES.DELETE_ERROR);
      }
    } catch (error) {
      alert(MESSAGES.DELETE_ERROR);
    } finally {
      setShowDeletePopup(false);
    }
  }, [clearChatHistory, clearMessages, inputRef, isApiKeyReady]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Computed values
  const placeholderText = useMemo(
    () =>
      isApiKeyReady
        ? "Hỏi bất kỳ điều gì"
        : "Vui lòng cấu hình API key để bắt đầu chat",
    [isApiKeyReady]
  );

  const renderedMessages = useMemo(
    () => (
      <>
        {messages.map((message, index) => (
          <ChatMessage
            key={`${index}-${message.timestamp}`}
            message={message}
            index={index}
          />
        ))}
        {isLoading && <LoadingMessage />}
      </>
    ),
    [messages, isLoading]
  );

  return (
    <div
      className={`pt-4 sm:pt-6 md:pt-8 pb-[300px] transition-all duration-300 overflow-y-scroll h-[100vh] w-full px-2 sm:px-4`}
      style={{ scrollbarGutter: "stable" }}
      ref={containerRef}
    >
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

      <div className="container mx-auto">
        <div className="flex flex-col h-full overflow-hidden relative w-full sm:w-[95%] md:w-[800px] mx-auto">
          <div className="flex-1 flex flex-col">{renderedMessages}</div>
        </div>
      </div>

      <ChatInput
        input={input}
        onInputChange={setInput}
        onSendMessage={handleSendMessage}
        onKeyDown={handleKeyDown}
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
        isThinking={isThinking}
        onThinkingToggle={toggleThinking}
        selectedModelId={selectedModelId}
        selectedModel={selectedModel}
        models={models}
        onModelSelect={handleModelSelect}
      />

      <ScrollToBottomButton
        onClick={() => scrollToBottom(220)}
        isVisible={showScrollButton}
      />
    </div>
  );
}
