import { useState, useEffect } from "react";

const THINKING_STORAGE_KEY = "thinking-enabled";

export const useThinkingToggle = (selectedModel?: string) => {
  const [isThinking, setIsThinkingEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(THINKING_STORAGE_KEY);
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    if (selectedModel) {
      const isProModel = selectedModel.toLowerCase().includes("2.5-pro");
      if (isProModel) {
        setIsThinkingEnabled(true);
      } else {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(THINKING_STORAGE_KEY);
          if (stored) {
            setIsThinkingEnabled(JSON.parse(stored));
          }
        }
      }
    }
  }, [selectedModel]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isProModel = selectedModel?.toLowerCase().includes("2.5-pro");
      if (!isProModel) {
        localStorage.setItem(THINKING_STORAGE_KEY, JSON.stringify(isThinking));
      }
    }
  }, [isThinking, selectedModel]);

  const toggleThinking = () => {
    if (selectedModel) {
      const isProModel = selectedModel.toLowerCase().includes("2.5-pro");
      if (isProModel) {
        return;
      }
    }

    setIsThinkingEnabled((prev) => !prev);
  };

  return {
    isThinking,
    toggleThinking,
  };
};
