import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  content: string;
  size?: number;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  content,
  size = 16,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Không thể sao chép nội dung!");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="mt-1 px-2 py-2 rounded-full border-none cursor-pointer transition-all duration-200 ease-in-out flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary active:scale-95"
    >
      {copied ? <Check size={size} /> : <Copy size={size} />}
    </button>
  );
};