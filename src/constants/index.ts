export const DB_CONFIG = {
  NAME: "ChatDB",
  VERSION: 1,
  STORE_NAME: "chatHistory",
  MAX_MESSAGES: 50,
} as const;

export const API_CONFIG = {
  ENDPOINT: "/api",
} as const;

export const UI_CONFIG = {
  MAX_TEXTAREA_HEIGHT: 400,
  MAX_CONTAINER_HEIGHT: 450,
  SCROLL_BEHAVIOR: "smooth" as ScrollBehavior,
} as const;

export const MESSAGES = {
  WELCOME: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
  TYPING: "typing...",
  API_KEY_REQUIRED: "Vui lòng cấu hình API key trước khi sử dụng!",
  DELETE_SUCCESS: "Xóa thành công",
  DELETE_ERROR: "Có lỗi xảy ra khi xóa lịch sử chat!",
  COPY_SUCCESS: "Đã sao chép",
  COPY_ERROR: "Không thể sao chép code!",
} as const;