import React from "react";
import { MarkdownRenderer } from "../highlight/markdown";
import { CopyButton } from "../button/copy-button";
import { LoadingMessage } from "./loading-message";
import { GeminiIcon } from "./gemini-icon";

interface BotMessageProps {
  content: string;
  timestamp: string;
  isMessageStreaming: boolean;
}

export const BotMessage: React.FC<BotMessageProps> = ({
  content,
  isMessageStreaming,
}) => {
  return (
    <div className="w-full mb-4">
      <GeminiIcon />
      <div className="leading-[2.2] break-words">
        <MarkdownRenderer content={content} />
      </div>

      {!isMessageStreaming && <CopyButton content={content} />}
    </div>
  );
};
