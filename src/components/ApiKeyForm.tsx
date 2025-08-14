import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Key, Save, X } from "lucide-react";

interface ApiKeyManagerProps {
  onApiKeySet: (apiKey: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyForm: React.FC<ApiKeyManagerProps> = ({
  onApiKeySet,
  isOpen,
  onClose,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("gemini_api_key");
    if (storedApiKey && storedApiKey.trim() !== "") {
      setHasApiKey(true);
      onApiKeySet(storedApiKey);
    }
  }, [onApiKeySet]);

  useEffect(() => {
    if (isOpen) {
      const currentKey = localStorage.getItem("gemini_api_key") || "";
      setApiKey(currentKey);
    }
  }, [isOpen]);

  const handleSaveApiKey = () => {
    const trimmedKey = apiKey.trim();
    if (trimmedKey === "") {
      alert("Vui lòng nhập API key!");
      return;
    }

    localStorage.setItem("gemini_api_key", trimmedKey);
    setHasApiKey(true);
    onApiKeySet(trimmedKey);
    onClose();
  };

  const handleRemoveApiKey = () => {
    if (confirm("Bạn có chắc chắn muốn xóa API key?")) {
      localStorage.removeItem("gemini_api_key");
      setHasApiKey(false);
      setApiKey("");
      onApiKeySet("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Key className="mr-2" size={24} />
              Cấu hình Gemini API Key
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="apikey..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={showApiKey ? "Hide API key" : "Show API key"}
                >
                  {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Hướng dẫn lấy Gemini API Key:
              </h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>
                  1. Truy cập{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-600"
                  >
                    Google AI Studio
                  </a>
                </li>
                <li>2. Đăng nhập bằng tài khoản Google</li>
                <li>3. Nhấn "Create API Key"</li>
                <li>4. Sao chép và dán API key vào đây</li>
              </ol>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim()}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
              >
                <Save size={16} />
                <span>Lưu API Key</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
              >
                Hủy
              </button>
            </div>

            {hasApiKey && (
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={handleRemoveApiKey}
                  className="w-full px-4 py-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
                >
                  Xóa API Key
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyForm;
