import { useState, useCallback, useRef } from "react";
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
      // Nếu đã hiển thị hết, dừng animation frame
      animationFrameRef.current = null;
    }
  }, [updateLastMessage]);

  const startTextAnimation = useCallback((text: string) => {
    targetTextRef.current = text;
    
    // Nếu chưa có animation đang chạy, bắt đầu mới
    if (animationFrameRef.current === null) {
      animateText();
    }
    // Nếu đã có animation, nó sẽ tự động lấy targetTextRef mới
  }, [animateText]);

  const stopTextAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (targetTextRef.current) {
      updateLastMessage(targetTextRef.current);
      currentIndexRef.current = targetTextRef.current.length;
    }
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
      const loadingMessage = createMessage(false, "typing...");

      addMessage(userMessage);
      addMessage(loadingMessage);
      setIsLoading(true);

      // Reset animation state
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

        // Gọi API với streaming callback
        const response = await ChatApi.sendMessage(
          {
            question,
            chatHistory,
            apiKey,
            model,
          },
          (streamedText) => {
            // Nếu là chunk đầu tiên, bắt đầu animation
            if (isFirstChunk) {
              isFirstChunk = false;
              currentIndexRef.current = 0;
            }
            // Cập nhật target text và bắt đầu/tiếp tục animation
            startTextAnimation(streamedText);
          }
        );

        // Đảm bảo hiển thị full text cuối cùng
        stopTextAnimation();

        // Lưu vào history sau khi hoàn tất
        await saveMessageToHistory(true, question);
        await saveMessageToHistory(false, response);

        return response;
      } catch (error) {
        stopTextAnimation();
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
    sendMessage,
    clearMessages,
    setMessages,
  };
};