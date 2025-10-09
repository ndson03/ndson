import React, { useRef, useCallback, useEffect, useState } from "react";
import { Key, ArrowUp, Trash2 } from "lucide-react";
import { ModelSelector } from "./model-selector";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onApiKeyConfig: () => void;
  onDeleteHistory: (e: React.MouseEvent) => void;
  isApiKeyReady: boolean;
  isLoading: boolean;
  placeholder: string;
  isWelcome: boolean;
  setInputRef?: (ref: HTMLTextAreaElement | null) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  onInputChange,
  onSendMessage,
  onKeyDown,
  onApiKeyConfig,
  onDeleteHistory,
  isApiKeyReady,
  isLoading,
  placeholder,
  isWelcome,
  setInputRef,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Callback ref to pass textarea element up to parent
  const textareaCallbackRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (setInputRef) {
        setInputRef(node);
      }
    },
    [setInputRef]
  );

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
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onInputChange(e.target.value);
      requestAnimationFrame(() => {
        autoResize();
      });
    },
    [onInputChange, autoResize]
  );

  useEffect(() => {
    if (isApiKeyReady && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isApiKeyReady]);

  useEffect(() => {
    if (textareaRef.current && isApiKeyReady) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [input, autoResize]);

  const handleChatInputContainerClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as Element;
    if (
      !target.closest(".apikey-config-button") &&
      !target.closest(".model-selector") &&
      !target.closest(".send-button") &&
      !target.closest(".clear-button")
    ) {
      textareaRef.current?.focus();
    }
  }, []);

  const isSendButtonDisabled = isLoading || !isApiKeyReady;
  const sendButtonTitle = !isApiKeyReady
    ? "Vui lòng cấu hình API key"
    : "Gửi câu hỏi";

  return (
    <>
      <div
        className="chat-input-container"
        onClick={handleChatInputContainerClick}
        style={{
          bottom: isWelcome ? "auto" : "0px",
        }}
      >
        <textarea
          ref={textareaCallbackRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={!isApiKeyReady}
          className={`questionInput ${!isApiKeyReady ? "disabled" : ""}`}
          rows={1}
        />
        <div className="button-container">
          <div className="left-buttons">
            <div
              className="apikey-config-button"
              onClick={onApiKeyConfig}
              title="Cấu hình API Key"
            >
              <Key size={16} />
            </div>
            <ModelSelector />
          </div>
          <div className="right-buttons">
            <div
              className={`send-button ${
                isSendButtonDisabled ? "disabled" : ""
              }`}
              onClick={onSendMessage}
              title={sendButtonTitle}
            >
              <ArrowUp size={16} />
            </div>
            <div
              className="clear-button"
              onClick={onDeleteHistory}
              title="Xóa lịch sử chat"
            >
              <Trash2 size={16} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
