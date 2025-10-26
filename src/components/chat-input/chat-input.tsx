import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUp, Trash2, Settings } from "lucide-react";
import { ModelSelector } from "./model-selector";
import { DeletePopup } from "./delete-chat-history-popup";
import { useAutoResize } from "@/src/hooks/use-auto-resize";
import { ThinkingToggle } from "./thinking-toggle";
import { Model } from "@/src/types";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/src/provider/setting-provider";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClearHistory: () => void;
  isLoading: boolean;
  isWelcome: boolean;
  setInputRef?: (ref: HTMLTextAreaElement | null) => void;
  isThinking: boolean;
  onThinkingToggle: () => void;
  selectedModelId: string;
  selectedModel?: Model;
  models: Model[];
  onModelSelect: (modelId: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  onInputChange,
  onSendMessage,
  onKeyDown,
  onClearHistory,
  isLoading,
  isWelcome,
  setInputRef,
  isThinking,
  onThinkingToggle,
  selectedModelId,
  selectedModel,
  models,
  onModelSelect,
}) => {
  const { t } = useTranslation();
  const { isReady: isApiKeyReady, openSettings } = useSettings();

  const { textareaRef, autoResize } = useAutoResize();
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const textareaCallbackRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (setInputRef) {
        setInputRef(node);
      }
    },
    [setInputRef, textareaRef]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onInputChange(e.target.value);
      requestAnimationFrame(() => {
        autoResize();
      });
    },
    [onInputChange, autoResize]
  );

  const handleChatInputContainerClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as Element;
      if (
        !target.closest(".apikey-config-button") &&
        !target.closest(".model-selector") &&
        !target.closest(".send-button") &&
        !target.closest(".clear-button") &&
        !target.closest(".thinking-toggle")
      ) {
        textareaRef.current?.focus();
      }
    },
    [textareaRef]
  );

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = () => {
    onClearHistory();
    setShowDeletePopup(false);
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
  };

  useEffect(() => {
    if (isApiKeyReady && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isApiKeyReady, textareaRef]);

  useEffect(() => {
    if (textareaRef.current && isApiKeyReady) {
      textareaRef.current.focus();
    }
  }, [isApiKeyReady, textareaRef]);

  useEffect(() => {
    autoResize();
  }, [input, autoResize]);

  const isSendButtonDisabled = isLoading || !isApiKeyReady;

  return (
    <div
      className={`flex flex-col items-stretch w-[90vw] sm:w-[80vw] md:w-[800px] max-w-[800px] z-10 border border-border rounded-4xl bg-card p-1 pl-2 pr-2 pb-2 max-h-[350px] cursor-text shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300 mx-0 sm:mx-0 md:mx-0 ${
        isWelcome
          ? "fixed left-1/2 top-1/2 translate-x-[calc(-50%-5px)] -translate-y-[30px]"
          : "fixed left-1/2 bottom-1 translate-x-[calc(-50%-5px)]"
      }`}
      onClick={handleChatInputContainerClick}
    >
      <textarea
        ref={textareaCallbackRef}
        value={input}
        onChange={handleInputChange}
        onKeyDown={onKeyDown}
        placeholder={
          isApiKeyReady ? t("input.placeholder") : t("input.placeholderNoKey")
        }
        disabled={!isApiKeyReady}
        className={`flex-1 border-none p-1.5 pl-2 pr-2 resize-none w-full transition-all duration-200 ease-in-out focus:outline-none text-sm sm:text-base bg-transparent text-foreground placeholder:text-muted-foreground ${
          !isApiKeyReady ? "disabled" : ""
        }`}
        rows={1}
      />
      <div className="flex justify-between items-center gap-1 sm:gap-2">
        <div className="flex items-center gap-0.5 sm:gap-1">
          <div
            className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full cursor-pointer transition-colors duration-200 ease-in-out text-primary bg-secondary hover:bg-secondary/80 active:bg-secondary/60 apikey-config-button"
            onClick={openSettings}
          >
            <Settings size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <ThinkingToggle
            enabled={isThinking}
            onToggle={onThinkingToggle}
            selectedModel={selectedModelId}
          />
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <ModelSelector
            selectedModelId={selectedModelId}
            selectedModel={selectedModel}
            models={models}
            onModelSelect={onModelSelect}
          />
          <div
            className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full cursor-pointer transition-colors duration-200 ease-in-out text-primary bg-secondary hover:bg-secondary/80 active:bg-secondary/60 send-button ${
              isSendButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={onSendMessage}
          >
            <ArrowUp size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>

          <DeletePopup
            isOpen={showDeletePopup}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          >
            <div
              className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full cursor-pointer transition-colors duration-200 ease-in-out text-primary bg-secondary hover:bg-secondary/80 active:bg-secondary/60 clear-button"
              onClick={handleDeleteClick}
            >
              <Trash2 size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </DeletePopup>
        </div>
      </div>
    </div>
  );
};
