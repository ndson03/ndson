import React from "react";
import { Message } from "../types";
import { UserMessage } from "./UserMessage";
import { BotMessage } from "./BotMessage";

interface ChatMessageProps {
  message: Message;
  index: number;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, index }) => {
  if (message.isUser) {
    return (
      <UserMessage content={message.content} timestamp={message.timestamp} />
    );
  }

  return <BotMessage content={message.content} timestamp={message.timestamp} />;
};
