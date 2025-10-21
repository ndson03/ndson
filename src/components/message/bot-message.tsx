import React from "react";
import { MarkdownRenderer } from "../highlight/markdown";
import { CopyButton } from "../button/copy-button";

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
      <div className="leading-[2.2] break-words">
        <MarkdownRenderer content={content} />
      </div>

      {!isMessageStreaming && <CopyButton content={content} />}
    </div>
  );
};
