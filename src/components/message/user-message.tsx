import React from "react";

interface UserMessageProps {
  content: string;
  timestamp: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({ content }) => {
  return (
    <div className="flex flex-col items-end leading-[2.2] mb-2.5">
      <div className="max-w-[90%] px-4 py-1 rounded-[1.5rem] bg-[#e9e9e980] break-words text-black whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
};
