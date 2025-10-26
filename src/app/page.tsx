"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useScrollToBottom } from "../hooks/use-scroll-to-bottom";
import { useIndexedDB } from "../hooks/use-indexed-db";
import { useChat } from "../hooks/use-chat";
import { useModelSelector } from "../hooks/use-model-selector";
import { useThinkingToggle } from "../hooks/use-thinking-toggle";
import { handleApiError } from "../utils/error-handler";
import { MESSAGES } from "../constants";

import { ChatMessage } from "../components/message/chat-message";
import WelcomeMessage from "../components/message/welcom-message";
import SettingDialog from "../components/setting/setting-dialog";
import { ChatInput } from "../components/chat-input/chat-input";
import { LoadingMessage } from "../components/message/loading-message";
import { ScrollToBottomButton } from "../components/button/scroll-to-bottom-button";
import { useSettings } from "../provider/setting-provider";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [isWelcome, setIsWelcome] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { t } = useTranslation();
  const { apiKey, isReady: isApiKeyReady } = useSettings();
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

  const {
    messages,
    isLoading,
    isMessageStreaming,
    sendMessage,
    clearMessages,
    setMessages,
  } = useChat({
    buildChatHistoryForAPI,
    saveMessageToHistory,
    selectedModel: selectedModelId,
    apiKey,
    isThinking,
  });

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

  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      scrollToBottom(250);
      setIsInitialLoad(false);
    }
  }, [messages, isInitialLoad, scrollToBottom]);

  const handleSendMessage = useCallback(async () => {
    if (!isApiKeyReady) {
      alert(MESSAGES.API_KEY_REQUIRED);
      return;
    }

    const question = input.trim();
    if (!question || isLoading || isMessageStreaming) return;

    setInput("");
    setIsWelcome(false);

    try {
      scrollToBottom();
      await sendMessage(question);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      setInput(question);

      if (messages.length === 0) {
        setIsWelcome(true);
      }

      toast.error(errorMessage);
    }
  }, [
    isApiKeyReady,
    input,
    isLoading,
    isMessageStreaming,
    sendMessage,
    messages.length,
    scrollToBottom,
  ]);

  const handleClearHistory = useCallback(async () => {
    try {
      const success = await clearChatHistory();

      if (success) {
        clearMessages();
        setIsWelcome(true);
      } else {
        alert(t("messages.deleteError"));
      }
    } catch (error) {
      alert(t("messages.deleteError"));
    }
  }, [clearChatHistory, clearMessages, isApiKeyReady, t]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const renderedMessages = useMemo(
    () => (
      <>
        {messages.map((message, index) => (
          <ChatMessage
            key={`${index}-${message.timestamp}`}
            message={message}
            index={index}
            isLoading={
              (isLoading || isMessageStreaming) && index === messages.length - 1
            }
          />
        ))}
        {isLoading && <LoadingMessage />}
      </>
    ),
    [messages, isLoading, isMessageStreaming]
  );

  return (
    <div
      className={`pt-4 sm:pt-6 md:pt-8 pb-[300px] transition-all duration-300 overflow-y-scroll h-[96vh] w-full px-2 sm:px-4`}
      style={{ scrollbarGutter: "stable" }}
      ref={containerRef}
    >
      {isWelcome && <WelcomeMessage />}

      <div className="container mx-auto ">
        <div className="flex flex-col h-full overflow-hidden relative w-full sm:w-[95%] md:w-[800px] mx-auto">
          <div className="flex-1 flex flex-col">{renderedMessages}</div>
        </div>
      </div>

      <ChatInput
        input={input}
        onInputChange={setInput}
        onSendMessage={handleSendMessage}
        onKeyDown={handleKeyDown}
        onClearHistory={handleClearHistory}
        isLoading={isLoading || isMessageStreaming}
        isWelcome={isWelcome}
        isThinking={isThinking}
        onThinkingToggle={toggleThinking}
        selectedModelId={selectedModelId}
        selectedModel={selectedModel}
        models={models}
        onModelSelect={handleModelSelect}
      />

      <ScrollToBottomButton
        onClick={() => scrollToBottom(250)}
        isVisible={showScrollButton}
      />
    </div>
  );
}
