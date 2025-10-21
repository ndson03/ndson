import React, { useCallback, useEffect } from "react";
import { Key, ArrowUp, Trash2 } from "lucide-react";
import { ModelSelector } from "./model-selector";
import { useAutoResize } from "@/src/hooks/use-auto-resize";
import { ThinkingToggle } from "./thinking-toggle";
import { Model } from "@/src/types";

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
  onApiKeyConfig,
  onDeleteHistory,
  isApiKeyReady,
  isLoading,
  placeholder,
  isWelcome,
  setInputRef,
  isThinking,
  onThinkingToggle,
  selectedModelId,
  selectedModel,
  models,
  onModelSelect,
}) => {
  const { textareaRef, autoResize } = useAutoResize();

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
    <>
      <div
        className={`flex flex-col items-stretch sm:w-[95%] md:w-[800px] max-w-[800px] z-10 border border-black/15 rounded-2xl sm:rounded-3xl md:rounded-4xl bg-white p-1 pl-2 pr-2 pb-2 max-h-[350px] cursor-text shadow-[var(--card-shadow)] transition-all duration-300 mx-2 sm:mx-4 md:mx-0 ${
          isWelcome
            ? "fixed left-1/2 top-1/2 translate-x-[calc(-50%)] sm:translate-x-[calc(-50%-6px)] -translate-y-[30px]"
            : "fixed left-1/2 bottom-2 sm:bottom-0 translate-x-[calc(-50%)] sm:translate-x-[calc(-50%-6px)]"
        }`}
        onClick={handleChatInputContainerClick}
      >
        <textarea
          ref={textareaCallbackRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={!isApiKeyReady}
          className={`flex-1 border-none p-1.5 pl-2 pr-2 resize-none w-full transition-all duration-200 ease-in-out focus:outline-none text-sm sm:text-base ${
            !isApiKeyReady ? "disabled" : ""
          }`}
          rows={1}
        />
        <div className="flex justify-between items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <div
              className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full cursor-pointer transition-colors duration-200 ease-in-out text-gray-600 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 apikey-config-button"
              onClick={onApiKeyConfig}
            >
              <Key size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
              className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full cursor-pointer transition-colors duration-200 ease-in-out text-gray-600 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 send-button ${
                isSendButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={onSendMessage}
            >
              <ArrowUp size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div
              className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full cursor-pointer transition-colors duration-200 ease-in-out text-gray-600 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 clear-button"
              onClick={onDeleteHistory}
            >
              <Trash2 size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
