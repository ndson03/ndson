import React, { useRef, useCallback, useEffect } from "react";
import { Key, ArrowUp, Trash2 } from "lucide-react";

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
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const parent = textarea.parentElement as HTMLElement;
    if (!parent) return;

    textarea.style.height = "auto";
    parent.style.height = "auto";

    const newHeight = Math.min(textarea.scrollHeight, 400);
    textarea.style.height = `${newHeight}px`;

    const parentPadding = parent.offsetHeight - textarea.offsetHeight;
    const newParentHeight = newHeight + parentPadding;
    parent.style.height = `${Math.min(newParentHeight, 450)}px`;
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

  const handleChatInputContainerClick = useCallback(() => {
    textareaRef.current?.focus();
  }, [textareaRef]);

  const isSendButtonDisabled = isLoading || !isApiKeyReady;
  const sendButtonTitle = !isApiKeyReady
    ? "Vui lòng cấu hình API key"
    : "Gửi câu hỏi";

  return (
    <div
      className="chat-input-container"
      onClick={handleChatInputContainerClick}
    >
      <textarea
        ref={textareaRef}
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
        </div>
        <div className="right-buttons">
          <div
            className={`send-button ${isSendButtonDisabled ? "disabled" : ""}`}
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
  );
};
