import { useCallback, useRef } from "react";
import { UI_CONFIG } from "../constants";

export const useAutoResize = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const parent = textarea.parentElement as HTMLElement;
    if (!parent) return;

    textarea.style.height = "auto";
    parent.style.height = "auto";

    const newHeight = Math.min(textarea.scrollHeight, UI_CONFIG.MAX_TEXTAREA_HEIGHT);
    textarea.style.height = `${newHeight}px`;

    const parentPadding = parent.offsetHeight - textarea.offsetHeight;
    const newParentHeight = newHeight + parentPadding;
    parent.style.height = `${Math.min(newParentHeight, UI_CONFIG.MAX_CONTAINER_HEIGHT)}px`;
  }, []);

  return {
    textareaRef,
    autoResize,
  };
};