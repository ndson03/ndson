import { useState, useCallback } from "react";
import { Message } from "../types";
import { useIndexedDB } from "./useIndexedDB";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { saveMessageToHistory, buildChatHistoryForAPI } = useIndexedDB();

  const displayUserMessage = useCallback(
    (text: string) => {
      const newMessage: Message = {
        isUser: true,
        content: text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessage]);
      saveMessageToHistory(true, text);
    },
    [saveMessageToHistory]
  );

  const addBotMessage = useCallback(
    (content: string) => {
      const botMessage: Message = {
        isUser: false,
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
      saveMessageToHistory(false, content);
    },
    [saveMessageToHistory]
  );

  const updateLastMessage = useCallback((content: string) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          content,
        };
      }
      return newMessages;
    });
  }, []);

  const askQuestion = useCallback(
    async (question: string, apiKey: string) => {
      if (!question.trim() || isLoading) return;

      displayUserMessage(question);

      const loadingMessage: Message = {
        isUser: false,
        content: "typing...",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, loadingMessage]);
      setIsLoading(true);

      try {
        const chatHistory = await buildChatHistoryForAPI();
        const payload = { question, chatHistory, apiKey };

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
        updateLastMessage(responseText);
        saveMessageToHistory(false, responseText);
      } catch (error) {
        const errorMessage = `Có lỗi xảy ra: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        updateLastMessage(errorMessage);
        saveMessageToHistory(false, errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [
      isLoading,
      displayUserMessage,
      buildChatHistoryForAPI,
      updateLastMessage,
      saveMessageToHistory,
    ]
  );

  const resetMessages = useCallback(() => {
    const welcomeMessage: Message = {
      isUser: false,
      content: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  }, []);

  return {
    messages,
    setMessages,
    isLoading,
    askQuestion,
    resetMessages,
  };
};
