import React from "react";
import { Message } from "../../types";
import { UserMessage } from "./user-message";
import { BotMessage } from "./bot-message";

interface ChatMessageProps {
  message: Message;
  index: number;
  isMessageStreaming: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  index,
  isMessageStreaming,
}) => {
  if (message.isUser) {
    return (
      <UserMessage content={message.content} timestamp={message.timestamp} />
    );
  }

  return (
    <BotMessage
      content={message.content}
      isMessageStreaming={isMessageStreaming}
      timestamp={message.timestamp}
    />
  );
};
