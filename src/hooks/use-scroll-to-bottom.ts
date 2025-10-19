import { useCallback, useRef } from "react";
import { UI_CONFIG } from "../constants";

export const useScrollToBottom = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (!containerRef.current) return;

    const userMessages = containerRef.current.querySelectorAll(
      ".user-message-container"
    );
    const lastUserMessage = userMessages[userMessages.length - 1];

    if (lastUserMessage) {
      lastUserMessage.scrollIntoView({
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
