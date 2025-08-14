import React from "react";

interface UserMessageProps {
  content: string;
  timestamp: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({ content }) => {
  return (
    <div className="user-message-container">
      <div
        className="user-message-text"
        style={{
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          fontFamily: "inherit",
        }}
      >
        {content}
      </div>
    </div>
  );
};
