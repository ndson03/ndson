import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

type Language = "vi" | "en";

const LANGUAGE_STORAGE_KEY = "app_language";
const DEFAULT_LANGUAGE: Language = "vi";

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return (stored as Language) || DEFAULT_LANGUAGE;
    }
    return DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && stored !== language) {
        setLanguageState(stored as Language);
      }
    }
    i18n.changeLanguage(language);
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    i18n.changeLanguage(newLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    }
  };

  return {
    language,
    setLanguage,
  };
};
