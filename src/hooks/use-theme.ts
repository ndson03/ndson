import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export const useTheme = () => {
  const { theme, setTheme: setNextTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setNextTheme(newTheme);
  };

  const currentTheme = theme === "system" ? systemTheme : theme;

  return {
    theme: (theme as Theme) || "system",
    currentTheme: (currentTheme as "light" | "dark") || "light",
    setTheme,
    mounted,
  };
};
