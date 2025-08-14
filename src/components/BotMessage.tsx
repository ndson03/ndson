import React from "react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

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
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(marked(content) as string, {
                ALLOWED_TAGS: [
                  "p",
                  "br",
                  "strong",
                  "em",
                  "u",
                  "strike",
                  "code",
                  "pre",
                  "ul",
                  "ol",
                  "li",
                  "h1",
                  "h2",
                  "h3",
                  "h4",
                  "h5",
                  "h6",
                  "blockquote",
                  "a",
                  "img",
                  "table",
                  "thead",
                  "tbody",
                  "tr",
                  "td",
                  "th",
                ],
                ALLOWED_ATTR: ["href", "src", "alt", "title", "class"],
              }),
            }}
          />
        )}
      </div>
    </div>
  );
};
