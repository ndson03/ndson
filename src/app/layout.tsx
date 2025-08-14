import type { Metadata } from "next";
import "./globals.css";
import "highlight.js/styles/github.css";
import { Toaster } from "react-hot-toast";

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
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
