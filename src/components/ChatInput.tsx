import React, { useRef, useCallback, useEffect, useState } from "react";
import { Key, ArrowUp, Trash2, ChevronDown } from "lucide-react";

interface Model {
  id: string;
  name: string;
  description?: string;
}

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
  models?: Model[];
}

const DEFAULT_MODELS: Model[] = [
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Next generation features, speed, and realtime streaming.",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description:
      "Enhanced thinking and reasoning, multimodal understanding, advanced coding, and more",
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash-Lite",
    description: "Most cost-efficient model supporting high throughput",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Adaptive thinking, cost efficiency",
  },
];

const STORAGE_KEY = "selected-model";
const DEFAULT_MODEL = "gemini-2.5-flash";

const getStoredModel = (): string => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_MODEL;
    }
    return DEFAULT_MODEL;
  } catch (error) {
    console.warn("localStorage not available, using default model");
    return DEFAULT_MODEL;
  }
};

const storeModel = (modelId: string): void => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, modelId);
    }
  } catch (error) {
    console.warn("localStorage not available, cannot store model selection");
  }
};

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
  models = DEFAULT_MODELS,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelButtonRef = useRef<HTMLButtonElement>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // State để lưu selected model, khởi tạo từ localStorage
  const [selectedModel, setSelectedModel] = useState<string>(() =>
    getStoredModel()
  );

  // Callback ref để pass textarea element lên parent
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

  const handleModelSelect = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    storeModel(modelId);
    setIsModelDropdownOpen(false);
  }, []);

  const handleModelButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (modelButtonRef.current) {
        const rect = modelButtonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.top - 8,
          left: rect.left,
        });
      }

      setIsModelDropdownOpen(!isModelDropdownOpen);
    },
    [isModelDropdownOpen]
  );

  useEffect(() => {
    const storedModel = getStoredModel();
    const isValidModel = models.some((model) => model.id === storedModel);

    if (!isValidModel) {
      setSelectedModel(DEFAULT_MODEL);
      storeModel(DEFAULT_MODEL);
    } else if (selectedModel !== storedModel) {
      setSelectedModel(storedModel);
    }
  }, [models, selectedModel]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest(".model-list") &&
        !target.closest(".model-selector")
      ) {
        setIsModelDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChatInputContainerClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as Element;
    if (
      target.closest(".model-selector") ||
      target.closest(".fixed.bg-white")
    ) {
      return;
    }
    textareaRef.current?.focus();
  }, []);

  const isSendButtonDisabled = isLoading || !isApiKeyReady;
  const sendButtonTitle = !isApiKeyReady
    ? "Vui lòng cấu hình API key"
    : "Gửi câu hỏi";

  const selectedModelObj = models.find((m) => m.id === selectedModel);

  return (
    <>
      {isModelDropdownOpen && (
        <div
          className="model-list fixed bg-white border border-gray-200 rounded-lg shadow-lg"
          style={{
            zIndex: 9999,
            width: "256px",
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            transform: "translateY(-100%)",
          }}
        >
          <div className="py-1">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleModelSelect(model.id);
                }}
                className={`cursor-pointer w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors ${
                  selectedModel === model.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-900"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{model.name}</span>
                  {model.description && (
                    <span className="text-xs text-gray-500 mt-0.5">
                      {model.description}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

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
            <div className="relative model-selector">
              <button
                ref={modelButtonRef}
                onClick={handleModelButtonClick}
                className="cursor-pointer flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                title="Chọn model"
              >
                <span className="font-medium text-gray-900 text-xs">
                  {selectedModelObj?.name || selectedModel}
                </span>
                <ChevronDown
                  size={14}
                  className={`ml-1 text-gray-400 transition-transform ${
                    isModelDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
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

export const useSelectedModel = (): string => {
  const [selectedModel, setSelectedModel] = useState<string>(() =>
    getStoredModel()
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setSelectedModel(getStoredModel());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return selectedModel;
};
