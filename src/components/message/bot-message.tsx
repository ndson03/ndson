import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { MarkdownRenderer } from "../highlight/markdown";

interface BotMessageProps {
  content: string;
  timestamp: string;
  isMessageStreaming: boolean;
}

export const BotMessage: React.FC<BotMessageProps> = ({
  content,
  isMessageStreaming,
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
    <div className="w-full mb-4">
      <div className="leading-[2.2] break-words">
        <MarkdownRenderer content={content} />
      </div>

      {!isMessageStreaming && (
        <button
          onClick={handleCopy}
          className="mt-2 px-2 py-2 rounded-full border-none cursor-pointer transition-all duration-200 ease-in-out flex items-center gap-1 text-sm text-[#586069] hover:text-gray-900 hover:bg-gray-100 active:scale-95"
        >
          {copied ? (
            <>
              <Check size={16} />
            </>
          ) : (
            <>
              <Copy size={16} />
            </>
          )}
        </button>
      )}
    </div>
  );
};
