export const en = {
  // Common
  hello: "Hello",
  chat: "Chat",
  cancel: "Cancel",
  save: "Save",
  delete: "Delete",
  confirm: "Confirm",
  close: "Close",
  copy: "Copy",
  copied: "Copied",

  // Welcome
  welcome: {
    title: "How can I help you?",
    subtitle: "Start a conversation by typing your question below",
  },

  // Chat Input
  input: {
    placeholder: "Ask anything",
    placeholderNoKey: "Please configure API key to start chatting",
    send: "Send",
    sending: "Sending...",
  },

  // Settings Dialog
  settings: {
    title: "Settings",
    apiKey: {
      label: "Gemini API Key",
      placeholder: "Enter your API key...",
      show: "Show API key",
      hide: "Hide API key",
    },
    guide: {
      title: "How to get Gemini API Key:",
      step1: "Visit",
      step1Link: "Google AI Studio",
      step2: "Sign in with your Google account",
      step3: 'Click "Create API Key"',
      step4: "Copy and paste the API key here",
    },
    theme: {
      label: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",
    },
    language: {
      label: "Language",
      vi: "Vietnamese",
      en: "English",
    },
  },

  // Messages
  messages: {
    apiKeyRequired: "Please configure API key before chatting",
    deleteConfirm: "Delete all chat history?",
    deleteSuccess: "Chat history deleted successfully",
    deleteError: "An error occurred while deleting chat history",
    loadError: "Failed to load chat history",
    sendError: "An error occurred while sending message",
  },

  // Buttons
  buttons: {
    clearHistory: "Clear History",
    scrollToBottom: "Scroll to Bottom",
    apiKeyConfig: "Configure API Key",
    thinkingMode: "Deep Thinking",
    selectModel: "Select Model",
  },

  // Models
  models: {
    flashLite: "Lightweight, High Speed",
    flash: "Comprehensive Fast Assistance",
    pro: "Reasoning, Math & Coding",
    thinking: "Thinking (Deep Reasoning)",
  },

  // Loading
  loading: {
    thinking: "Thinking...",
    generating: "Generating response...",
  },

  // Errors
  errors: {
    network: "Network connection error",
    apiKey: "Invalid API key",
    rateLimit: "Rate limit exceeded",
    unknown: "An unknown error occurred",
  },
} as const;