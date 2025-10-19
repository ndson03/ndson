import type { Metadata } from "next";
import "./globals.css";
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
      <body className="font-sans font-normal text-base text-black bg-white overflow-x-hidden antialiased">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
