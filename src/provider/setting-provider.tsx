"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import SettingDialog from "@/src/components/setting/setting-dialog";

interface SettingsContextType {
  apiKey: string;
  isReady: boolean;
  setKey: (key: string) => void;
  validate: () => boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [isReady, setIsReady] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("gemini_api_key") || "";
    const trimmedKey = storedApiKey.trim();

    setApiKey(trimmedKey);
    setIsReady(trimmedKey !== "");
  }, []);

  const setKey = useCallback((key: string) => {
    const trimmedKey = key.trim();
    setApiKey(trimmedKey);
    setIsReady(trimmedKey !== "");

    if (trimmedKey !== "") {
      localStorage.setItem("gemini_api_key", trimmedKey);
    } else {
      localStorage.removeItem("gemini_api_key");
    }
  }, []);

  const validate = useCallback(() => {
    return apiKey.trim() !== "";
  }, [apiKey]);

  const openSettings = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value: SettingsContextType = {
    apiKey,
    isReady,
    setKey,
    validate,
    openSettings,
    closeSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
      <SettingDialog
        apiKey={apiKey}
        onApiKeyChange={setKey}
        isOpen={isOpen}
        onClose={closeSettings}
      />
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
