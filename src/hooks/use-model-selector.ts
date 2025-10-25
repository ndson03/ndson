import { useState, useEffect, useCallback } from "react";
import { Model } from "../types";

export const DEFAULT_MODELS: Model[] = [
  {
    id: "gemini-2.5-flash-lite",
    name: "2.5 Flash-Lite",
    description: "Nhẹ, tốc độ cao",
  },
  {
    id: "gemini-2.5-flash",
    name: "2.5 Flash",
    description: "Trợ giúp nhanh toàn diện",
  },
  {
    id: "gemini-2.5-pro",
    name: "2.5 Pro",
    description: "Suy luận, giải toán và lập trình",
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

export const useModelSelector = () => {
  const [selectedModelId, setSelectedModelId] = useState<string>(() =>
    getStoredModel(INITIAL_DEFAULT_MODEL_ID)
  );

  const handleModelSelect = useCallback((modelId: string) => {
    setSelectedModelId(modelId);
    storeModel(modelId);
  }, []);

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

  const selectedModel = DEFAULT_MODELS.find((m) => m.id === selectedModelId);

  return {
    selectedModelId,
    selectedModel,
    models: DEFAULT_MODELS,
    handleModelSelect,
  };
};
