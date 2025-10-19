import { useState, useCallback, useRef, useEffect } from "react";
import { Message, ApiMessage } from "../types";
import { StorageService } from "../services/storage-service";

export const useIndexedDB = () => {
  const [isDBInitialized, setIsDBInitialized] = useState(false);
  const storageServiceRef = useRef<StorageService | null>(null);

  // Initialize database
  useEffect(() => {
    const initDB = async () => {
      try {
        const service = new StorageService();
        await service.initialize();
        storageServiceRef.current = service;
        setIsDBInitialized(true);
      } catch (error) {
        console.error("Failed to initialize database:", error);
        setIsDBInitialized(false);
      }
    };

    initDB();
  }, []);

  const saveMessageToHistory = useCallback(
    async (isUser: boolean, content: string): Promise<void> => {
      if (!storageServiceRef.current) {
        console.error("Database not initialized");
        return;
      }

      try {
        await storageServiceRef.current.saveMessage(isUser, content);
      } catch (error) {
        console.error("Failed to save message:", error);
        throw error;
      }
    },
    []
  );

  const loadChatHistory = useCallback(async (): Promise<Message[]> => {
    if (!storageServiceRef.current) {
      console.error("Database not initialized");
      return [];
    }

    try {
      return await storageServiceRef.current.loadMessages();
    } catch (error) {
      console.error("Failed to load chat history:", error);
      return [];
    }
  }, []);

  const buildChatHistoryForAPI = useCallback(async (): Promise<
    ApiMessage[]
  > => {
    if (!storageServiceRef.current) {
      console.error("Database not initialized");
      return [];
    }

    try {
      return await storageServiceRef.current.buildApiHistory();
    } catch (error) {
      console.error("Failed to build chat history for API:", error);
      return [];
    }
  }, []);

  const clearChatHistory = useCallback(async (): Promise<boolean> => {
    if (!storageServiceRef.current) {
      console.error("Database not initialized");
      return false;
    }

    try {
      await storageServiceRef.current.clearMessages();
      return true;
    } catch (error) {
      console.error("Failed to clear chat history:", error);
      return false;
    }
  }, []);

  return {
    isDBInitialized,
    saveMessageToHistory,
    loadChatHistory,
    buildChatHistoryForAPI,
    clearChatHistory,
  };
};
