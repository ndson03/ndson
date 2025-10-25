import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { I18nProvider } from "../provider/i18n-provider";

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
    <html lang="vi">
      <body className="font-sans font-normal text-base text-black bg-white overflow-x-hidden antialiased">
        <I18nProvider>{children}</I18nProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
