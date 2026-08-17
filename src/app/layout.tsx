import type { Metadata } from "next";
import "./globals.css";
import "antd/dist/reset.css";
import { Toaster } from "react-hot-toast";
import { I18nProvider } from "../provider/i18n-provider";
import { ThemeProvider } from "../provider/theme-provider";
import { SettingsProvider } from "../provider/setting-provider";

export const metadata: Metadata = {
  title: "ndson",
  description: "AI Chat Assistant",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="font-sans font-normal text-base antialiased"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="app_theme"
        >
          <I18nProvider>
            <SettingsProvider>{children}</SettingsProvider>
          </I18nProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              className: "dark:bg-card dark:text-foreground",
              style: {
                background: "var(--background)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
