import React, { useRef, useState, useCallback, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Model {
  id: string;
  name: string;
  description?: string;
}

const DEFAULT_MODELS: Model[] = [
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Ổn định",
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash-Lite",
    description: "Nhẹ, rẻ, tốc độ cao, quy mô lớn",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Nhanh, cân bằng giữa tốc độ và chi phí",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "Mạnh, cho bài toán phức tạp và code nặng",
  },
];

const STORAGE_KEY = "selected-model";
const INITIAL_DEFAULT_MODEL_ID = "gemini-2.5-flash";

const getStoredModel = (defaultModelId: string): string => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem(STORAGE_KEY) || defaultModelId;
    }
    return defaultModelId;
  } catch (error) {
    console.warn("localStorage not available, using default model:", error);
    return defaultModelId;
  }
};

const storeModel = (modelId: string): void => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, modelId);
    }
  } catch (error) {
    console.warn(
      "localStorage not available, cannot store model selection:",
      error
    );
  }
};

export const ModelSelector = () => {
  const modelButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const [selectedModelId, setSelectedModelId] = useState<string>(() =>
    getStoredModel(INITIAL_DEFAULT_MODEL_ID)
  );

  const handleModelButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (modelButtonRef.current) {
      const rect = modelButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.top - 8,
        left: rect.left,
      });
    }
    setIsModelDropdownOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback((modelId: string) => {
    setSelectedModelId(modelId);
    storeModel(modelId);
    setIsModelDropdownOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modelButtonRef.current &&
        !modelButtonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelDropdownOpen(false);
      }
    };

    if (isModelDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModelDropdownOpen]);

  useEffect(() => {
    const storedModel = getStoredModel(INITIAL_DEFAULT_MODEL_ID);
    const isValidModel = DEFAULT_MODELS.some(
      (model) => model.id === storedModel
    );

    if (!isValidModel) {
      setSelectedModelId(INITIAL_DEFAULT_MODEL_ID);
      storeModel(INITIAL_DEFAULT_MODEL_ID);
    } else if (selectedModelId !== storedModel) {
      setSelectedModelId(storedModel);
    }
  }, [selectedModelId]);

  const selectedModelObj = DEFAULT_MODELS.find((m) => m.id === selectedModelId);

  return (
    <div className="relative model-selector">
      <button
        ref={modelButtonRef}
        onClick={handleModelButtonClick}
        className="cursor-pointer flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none transition-colors"
        title="Chọn model"
      >
        <span className="font-medium text-gray-900 text-xs">
          {selectedModelObj?.name || selectedModelId}
        </span>
        <ChevronDown
          size={14}
          className={`ml-1 text-gray-400 transition-transform ${
            isModelDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isModelDropdownOpen && (
        <div
          ref={dropdownRef}
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
            {DEFAULT_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(model.id);
                }}
                className={`cursor-pointer w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors ${
                  selectedModelId === model.id
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
    </div>
  );
};
