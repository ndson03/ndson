import { useCallback } from "react";
import { RefObject } from "react";

export const useAutoResize = (
  textareaRef: RefObject<HTMLTextAreaElement | null>
) => {
  const autoResize = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const parent = textarea.parentElement as HTMLElement;
    if (!parent) return;

    textarea.style.height = "auto";
    parent.style.height = "auto";

    const newHeight = Math.min(textarea.scrollHeight, 300);
    textarea.style.height = `${newHeight}px`;

    const parentPadding = parent.offsetHeight - textarea.offsetHeight;
    const newParentHeight = newHeight + parentPadding;
    parent.style.height = `${Math.min(newParentHeight, 350)}px`;
  }, [textareaRef]);

  return {
    autoResize,
  };
};
