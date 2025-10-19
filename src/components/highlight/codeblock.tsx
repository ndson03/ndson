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
  language = "text" 
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
    <div className="code-block-wrapper">
      <div className="code-header">
        <span className="language-label">{language}</span>
        <button
          className="copy-button"
          onClick={handleCopy}
          title="Sao chép code"
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