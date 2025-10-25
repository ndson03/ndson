import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Model } from "../types";

const BASE_MODELS = [
  {
    id: "gemini-2.5-flash-lite",
    name: "2.5 Flash-Lite",
    descriptionKey: "models.flashLite",
  },
  {
    id: "gemini-2.5-flash",
    name: "2.5 Flash",
    descriptionKey: "models.flash",
  },
  {
    id: "gemini-2.5-pro",
    name: "2.5 Pro",
    descriptionKey: "models.pro",
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
  const { t } = useTranslation();
  const [selectedModelId, setSelectedModelId] = useState<string>(() =>
    getStoredModel(INITIAL_DEFAULT_MODEL_ID)
  );

  // Transform base models with translations
  const models: Model[] = BASE_MODELS.map((model) => ({
    id: model.id,
    name: model.name,
    description: t(model.descriptionKey),
  }));

  const handleModelSelect = useCallback((modelId: string) => {
    setSelectedModelId(modelId);
    storeModel(modelId);
  }, []);

  useEffect(() => {
    const storedModel = getStoredModel(INITIAL_DEFAULT_MODEL_ID);
    const isValidModel = BASE_MODELS.some((model) => model.id === storedModel);

    if (!isValidModel) {
      setSelectedModelId(INITIAL_DEFAULT_MODEL_ID);
      storeModel(INITIAL_DEFAULT_MODEL_ID);
    } else if (selectedModelId !== storedModel) {
      setSelectedModelId(storedModel);
    }
  }, [selectedModelId]);

  const selectedModel = models.find((m) => m.id === selectedModelId);

  return {
    selectedModelId,
    selectedModel,
    models,
    handleModelSelect,
  };
};
