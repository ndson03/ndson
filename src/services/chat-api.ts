import { API_CONFIG } from "../constants";
import { ApiPayload } from "../types";

export class ChatApi {
  static async sendMessage(payload: ApiPayload): Promise<string> {
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

    return response.text();
  }
}
