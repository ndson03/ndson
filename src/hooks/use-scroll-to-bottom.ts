import { useCallback, useRef, useState, useEffect } from "react";
import { UI_CONFIG } from "../constants";

export const useScrollToBottom = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback((offset: number = 0) => {
    const container = containerRef.current;
    if (!container) return;
    const maxScrollTop = container.scrollHeight - container.clientHeight;
    container.scrollTo({
      top: maxScrollTop - offset,
      behavior: UI_CONFIG.SCROLL_BEHAVIOR,
    });
  }, []);

  const checkScrollPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollButton(distanceFromBottom > 220);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollPosition);
    checkScrollPosition();

    const observer = new MutationObserver(() => {
      checkScrollPosition();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      observer.disconnect();
    };
  }, [checkScrollPosition]);

  return {
    containerRef,
    scrollToBottom,
    showScrollButton,
  };
};
