import { API_CONFIG } from "../constants";
import { ApiPayload } from "../types";


export class ApiService {
  static async sendMessage(payload: ApiPayload): Promise<string> {
    try {
      const response = await fetch(API_CONFIG.ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`${await response.text()}`);
      }

      return await response.text();
    } catch (error: any) {
      throw error;
    }
  }
}
