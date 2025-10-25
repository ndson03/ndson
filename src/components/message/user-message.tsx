import React, { useState } from "react";
import { CopyButton } from "../button/copy-button";

interface UserMessageProps {
  content: string;
  timestamp: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({ content }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex flex-col items-end leading-[2.2] group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-[90%] px-4 py-0 rounded-[1.5rem] bg-secondary/50 break-words text-foreground whitespace-pre-wrap">
        {content}
      </div>

      <div
        className={`transition-opacity ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <CopyButton content={content} />
      </div>
    </div>
  );
};