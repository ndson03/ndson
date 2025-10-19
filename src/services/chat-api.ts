import { API_CONFIG } from "../constants";
import { ApiPayload } from "../types";

export class ChatApi {
  static async sendMessage(
    payload: ApiPayload,
    onChunk?: (text: string) => void
  ): Promise<string> {
    const response = await fetch(API_CONFIG.ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    // Nếu không có callback, trả về như cũ
    if (!onChunk) {
      return response.text();
    }

    // Stream response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    if (!reader) {
      return response.text();
    }

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      onChunk(fullText);
    }

    return fullText;
  }
}
