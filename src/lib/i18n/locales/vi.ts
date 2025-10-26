export const vi = {
  // Common
  hello: "Xin chào",
  chat: "Trò chuyện",
  cancel: "Hủy",
  save: "Lưu",
  delete: "Xóa",
  confirm: "Xác nhận",
  close: "Đóng",
  copy: "Sao chép",
  copied: "Đã sao chép",
  deepThinking: "Nghĩ sâu",

  // Welcome
  welcome: {
    title: "Tôi có thể giúp gì cho bạn?",
    subtitle:
      "Hãy bắt đầu cuộc trò chuyện bằng cách nhập câu hỏi của bạn bên dưới",
  },

  // Chat Input
  input: {
    placeholder: "Hỏi bất kỳ điều gì",
    placeholderNoKey: "Vui lòng cấu hình API key để bắt đầu chat",
    send: "Gửi",
    sending: "Đang gửi...",
  },

  // Settings Dialog
  settings: {
    title: "Cài đặt",
    apiKey: {
      label: "Gemini API Key",
      placeholder: "Nhập API key của bạn...",
      show: "Hiện API key",
      hide: "Ẩn API key",
    },
    guide: {
      title: "Hướng dẫn lấy Gemini API Key:",
      step1: "Truy cập",
      step1Link: "Google AI Studio",
      step2: "Đăng nhập bằng tài khoản Google",
      step3: 'Nhấn "Create API Key"',
      step4: "Sao chép và dán API key vào đây",
    },
    theme: {
      label: "Giao diện",
      light: "Sáng",
      dark: "Tối",
      system: "Hệ thống",
    },
    language: {
      label: "Ngôn ngữ",
      vi: "Tiếng Việt",
      en: "Tiếng Anh",
    },
  },

  // Messages
  messages: {
    apiKeyRequired: "Vui lòng cấu hình API key trước khi chat",
    deleteConfirm: "Xóa toàn bộ lịch sử chat?",
    deleteSuccess: "Đã xóa lịch sử chat thành công",
    deleteError: "Có lỗi xảy ra khi xóa lịch sử chat",
    loadError: "Không thể tải lịch sử chat",
    sendError: "Có lỗi xảy ra khi gửi tin nhắn",
    apiKeySaved: "Đã lưu API key thành công",
  },

  // Buttons
  buttons: {
    clearHistory: "Xóa lịch sử",
    scrollToBottom: "Cuộn xuống cuối",
    apiKeyConfig: "Cấu hình API Key",
    selectModel: "Chọn mô hình",
  },

  // Models
  models: {
    flashLite: "Nhẹ, tốc độ cao",
    flash: "Trợ giúp nhanh toàn diện",
    pro: "Suy luận, giải toán và lập trình",
    thinking: "Thinking (Suy nghĩ sâu)",
  },

  // Loading
  loading: {
    thinking: "Đang suy nghĩ...",
    generating: "Đang tạo phản hồi...",
  },

  // Errors
  errors: {
    network: "Lỗi kết nối mạng",
    apiKey: "API key không hợp lệ",
    rateLimit: "Đã vượt quá giới hạn yêu cầu",
    unknown: "Đã xảy ra lỗi không xác định",
  },
} as const;
