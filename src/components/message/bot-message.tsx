import React from "react";
import { MarkdownRenderer } from "../highlight/markdown";

interface BotMessageProps {
  content: string;
  timestamp: string;
}

export const BotMessage: React.FC<BotMessageProps> = ({ content }) => {
  return (
    <div
      className="w-full leading-[2.2] break-words mb-4"
    >
        <MarkdownRenderer content={content} />
    </div>
  );
};
