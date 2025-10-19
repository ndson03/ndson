import React, { useRef, useState, useCallback, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Model } from "@/src/types";

interface ModelSelectorProps {
  selectedModelId: string;
  selectedModel?: Model;
  models: Model[];
  onModelSelect: (modelId: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  selectedModel,
  models,
  onModelSelect,
}) => {
  const modelButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

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

  const handleSelect = useCallback(
    (modelId: string) => {
      onModelSelect(modelId);
      setIsModelDropdownOpen(false);
    },
    [onModelSelect]
  );

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

  return (
    <div className="relative model-selector">
      <button
        ref={modelButtonRef}
        onClick={handleModelButtonClick}
        className="cursor-pointer flex items-center justify-between px-2 py-2 text-sm  rounded-full bg-white hover:bg-gray-100 focus:outline-none transition-colors"
        title="Chọn model"
      >
        <span className="font-medium text-gray-600">
          {selectedModel?.name || selectedModelId}
        </span>
        <ChevronDown
          size={14}
          className={`ml-1 text-gray-600 transition-transform ${
            isModelDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isModelDropdownOpen && (
        <div
          ref={dropdownRef}
          className="model-list absolute bg-white border border-gray-200 rounded-lg shadow-lg"
          style={{
            zIndex: 9999,
            width: "256px",
            bottom: "100%",
            left: 0,
            marginBottom: "8px",
          }}
        >
          <div className="py-1">
            {models.map((model) => (
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
