import { useState, useCallback } from "react";
import { Message } from "../types";
import { ChatApi } from "../services/chat-api";

interface UseChatParams {
  buildChatHistoryForAPI: () => Promise<any[]>;
  saveMessageToHistory: (isUser: boolean, content: string) => Promise<void>;
  apiKey: string;
  selectedModel?: string;
}

export const useChat = ({
  buildChatHistoryForAPI,
  saveMessageToHistory,
  apiKey,
  selectedModel,
}: UseChatParams) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = {
        ...newMessages[newMessages.length - 1],
        content,
      };
      return newMessages;
    });
  }, []);

  const removeLastMessages = useCallback((count: number) => {
    setMessages((prev) => prev.slice(0, -count));
  }, []);

  const createMessage = (isUser: boolean, content: string): Message => ({
    isUser,
    content,
    timestamp: new Date().toISOString(),
  });

  const sendMessage = useCallback(
    async (question: string) => {
      if (!question.trim() || isLoading) return;

      const userMessage = createMessage(true, question);
      const loadingMessage = createMessage(false, "typing...");

      addMessage(userMessage);
      addMessage(loadingMessage);
      setIsLoading(true);

      try {
        const chatHistory = await buildChatHistoryForAPI();
        const model =
          selectedModel ||
          localStorage.getItem("selected-model") ||
          "gemini-2.5-flash";

        const response = await ChatApi.sendMessage({
          question,
          chatHistory,
          apiKey,
          model,
        });

        updateLastMessage(response);

        await saveMessageToHistory(true, question);
        await saveMessageToHistory(false, response);

        return response;
      } catch (error) {
        removeLastMessages(2);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [
      isLoading,
      apiKey,
      selectedModel,
      buildChatHistoryForAPI,
      saveMessageToHistory,
      addMessage,
      updateLastMessage,
      removeLastMessages,
    ]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    setMessages,
  };
};
