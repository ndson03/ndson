import React from "react";
import { Message } from "../../types";
import { UserMessage } from "./user-message";
import { BotMessage } from "./bot-message";

interface ChatMessageProps {
  message: Message;
  index: number;
  isLoading: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  index,
  isLoading,
}) => {
  if (message.isUser) {
    return (
      <UserMessage content={message.content} timestamp={message.timestamp} />
    );
  }

  return (
    <BotMessage
      content={message.content}
      isLoading={isLoading}
      timestamp={message.timestamp}
    />
  );
};
