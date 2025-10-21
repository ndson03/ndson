import { useState, useCallback, useRef } from "react";
import { Message } from "../types";
import { ChatApi } from "../services/chat-api";

interface UseChatParams {
  buildChatHistoryForAPI: () => Promise<any[]>;
  saveMessageToHistory: (isUser: boolean, content: string) => Promise<void>;
  apiKey: string;
  selectedModel: string;
  isThinking: boolean;
}

export const useChat = ({
  buildChatHistoryForAPI,
  saveMessageToHistory,
  apiKey,
  selectedModel,
  isThinking,
}: UseChatParams) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMessageStreaming, setIsMessageStreaming] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const targetTextRef = useRef<string>("");
  const currentIndexRef = useRef<number>(0);

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

  const animateText = useCallback(() => {
    if (currentIndexRef.current < targetTextRef.current.length) {
      const nextIndex = Math.min(
        currentIndexRef.current + Math.ceil(Math.random() * 8 + 5),
        targetTextRef.current.length
      );

      const displayText = targetTextRef.current.slice(0, nextIndex);
      currentIndexRef.current = nextIndex;

      updateLastMessage(displayText);

      animationFrameRef.current = requestAnimationFrame(animateText);
    } else {
      animationFrameRef.current = null;
      setIsMessageStreaming(false);
    }
  }, [updateLastMessage]);

  const startTextAnimation = useCallback(
    (text: string) => {
      targetTextRef.current = text;
      setIsMessageStreaming(true);

      if (animationFrameRef.current === null) {
        animateText();
      }
    },
    [animateText]
  );

  const stopTextAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (targetTextRef.current) {
      updateLastMessage(targetTextRef.current);
      currentIndexRef.current = targetTextRef.current.length;
    }

    setIsMessageStreaming(false);
  }, [updateLastMessage]);

  const createMessage = (isUser: boolean, content: string): Message => ({
    isUser,
    content,
    timestamp: new Date().toISOString(),
  });

  const sendMessage = useCallback(
    async (question: string) => {
      if (!question.trim() || isLoading) return;

      const userMessage = createMessage(true, question);
      addMessage(userMessage);
      setIsLoading(true);

      currentIndexRef.current = 0;
      targetTextRef.current = "";
      stopTextAnimation();

      try {
        const chatHistory = await buildChatHistoryForAPI();
        const model =
          selectedModel ||
          localStorage.getItem("selected-model") ||
          "gemini-2.5-flash";

        let isFirstChunk = true;

        const response = await ChatApi.sendMessage(
          {
            question,
            chatHistory,
            apiKey,
            model,
            isThinking,
          },
          (streamedText) => {
            if (isFirstChunk) {
              isFirstChunk = false;
              setIsLoading(false);
              currentIndexRef.current = 0;
              const botMessage = createMessage(false, "");
              addMessage(botMessage);
            }
            startTextAnimation(streamedText);
          }
        );

        stopTextAnimation();

        await saveMessageToHistory(true, question);
        await saveMessageToHistory(false, response);

        return response;
      } catch (error) {
        stopTextAnimation();
        removeLastMessages(1);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [
      isLoading,
      apiKey,
      selectedModel,
      isThinking,
      buildChatHistoryForAPI,
      saveMessageToHistory,
      addMessage,
      updateLastMessage,
      removeLastMessages,
      startTextAnimation,
      stopTextAnimation,
    ]
  );

  const clearMessages = useCallback(() => {
    stopTextAnimation();
    setMessages([]);
  }, [stopTextAnimation]);

  return {
    messages,
    isLoading,
    isMessageStreaming,
    sendMessage,
    clearMessages,
    setMessages,
  };
};
