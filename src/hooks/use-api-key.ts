import { useState, useCallback, useEffect } from "react";

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState("");
  const [isReady, setIsReady] = useState(false);

  // Load API key from sessionStorage on mount
  useEffect(() => {
    const storedApiKey = sessionStorage.getItem("gemini_api_key") || "";
    if (storedApiKey.trim() !== "") {
      setApiKey(storedApiKey);
      setIsReady(true);
    }
  }, []);

  // Save to sessionStorage and update state
  const setKey = useCallback((key: string) => {
    const trimmedKey = key.trim();
    setApiKey(trimmedKey);
    setIsReady(trimmedKey !== "");

    if (trimmedKey !== "") {
      sessionStorage.setItem("gemini_api_key", trimmedKey);
    } else {
      sessionStorage.removeItem("gemini_api_key");
    }
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
