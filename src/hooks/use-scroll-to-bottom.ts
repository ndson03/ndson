import { useCallback, useRef, useState, useEffect } from "react";
import { UI_CONFIG } from "../constants";

export const useScrollToBottom = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: UI_CONFIG.SCROLL_BEHAVIOR,
    });
  }, []);

  const checkScrollPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    setShowScrollButton(distanceFromBottom > 200);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollPosition);
    checkScrollPosition();

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
    };
  }, [checkScrollPosition]);

  return {
    containerRef,
    scrollToBottom,
    showScrollButton,
  };
};
