export interface Message {
  id?: number;
  isUser: boolean;
  content: string;
  timestamp: string;
}

export interface ApiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface ApiPayload {
  question: string;
  chatHistory: ApiMessage[];
  apiKey: string;
  model: string;
}
