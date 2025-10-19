import React from "react";
import { MarkdownRenderer } from "../highlight/markdown";

interface BotMessageProps {
  content: string;
  timestamp: string;
}

export const BotMessage: React.FC<BotMessageProps> = ({ content }) => {
  const isTyping = content === "typing...";

  return (
    <div className={`bot-message ${isTyping ? "loading-message" : ""}`}>
      <div className="message-content">
        {isTyping ? (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <MarkdownRenderer content={content} />
        )}
      </div>
    </div>
  );
};
