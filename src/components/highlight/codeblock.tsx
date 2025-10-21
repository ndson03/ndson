import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "text",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Không thể sao chép code!");
    }
  };

  return (
    <div className="relative my-4 rounded-2xl overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 bg-[#f9f9f9] text-[#586069] text-sm">
        <span className="font-semibold uppercase text-sm tracking-wide">
          {language}
        </span>
        <button
          className="border-none cursor-pointer transition-transform duration-200 ease-in-out flex items-center gap-1 active:scale-95"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check size={16} /> Đã sao chép
            </>
          ) : (
            <>
              <Copy size={16} /> Sao chép
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{
          margin: 0,
          borderRadius: "0 0 8px 8px",
          padding: "1rem",
        }}
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};
