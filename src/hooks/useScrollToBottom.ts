import { useCallback, useRef } from "react";
import { UI_CONFIG } from "../constants";

export const useScrollToBottom = () => {
  const containerRef = useRef<HTMLElement>(null);

  const scrollToBottom = useCallback(() => {
    if (!containerRef.current) return;

    const botMessages = containerRef.current.querySelectorAll(".bot-message");
    const lastBotMessage = botMessages[botMessages.length - 1];

    if (lastBotMessage) {
      lastBotMessage.scrollIntoView({
        behavior: UI_CONFIG.SCROLL_BEHAVIOR,
        block: "start",
      });
    } else {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: UI_CONFIG.SCROLL_BEHAVIOR,
      });
    }
  }, []);

  return {
    containerRef,
    scrollToBottom,
  };
};