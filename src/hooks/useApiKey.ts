import { useState, useCallback } from "react";

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState("");
  const [isReady, setIsReady] = useState(false);

  const setKey = useCallback((key: string) => {
    setApiKey(key);
    setIsReady(key.trim() !== "");
  }, []);

  const validate = useCallback(() => {
    return apiKey.trim() !== "";
  }, [apiKey]);

  return {
    apiKey,
    isReady,
    setKey,
    validate,
  };
};