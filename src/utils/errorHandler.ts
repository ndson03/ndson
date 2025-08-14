export class ChatError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = "ChatError";
  }
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof ChatError) {
    return error.message;
  }

  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return "Yêu cầu đã bị hủy do timeout";
    }
    return `Có lỗi xảy ra: ${error.message}`;
  }

  return "Có lỗi không xác định xảy ra";
};
