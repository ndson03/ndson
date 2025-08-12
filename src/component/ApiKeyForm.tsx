import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Key, Save, X } from 'lucide-react';

interface ApiKeyManagerProps {
  onApiKeySet: (apiKey: string) => void;
}

const ApiKeyForm: React.FC<ApiKeyManagerProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Kiểm tra API key trong localStorage khi component mount
    const storedApiKey = localStorage.getItem('gemini_api_key');
    if (storedApiKey && storedApiKey.trim() !== '') {
      setHasApiKey(true);
      onApiKeySet(storedApiKey);
    } else {
      setIsModalOpen(true);
    }
  }, [onApiKeySet]);

  const handleSaveApiKey = () => {
    const trimmedKey = apiKey.trim();
    if (trimmedKey === '') {
      alert('Vui lòng nhập API key!');
      return;
    }

    localStorage.setItem('gemini_api_key', trimmedKey);
    setHasApiKey(true);
    setIsModalOpen(false);
    onApiKeySet(trimmedKey);
  };

  const handleChangeApiKey = () => {
    const currentKey = localStorage.getItem('gemini_api_key') || '';
    setApiKey(currentKey);
    setIsModalOpen(true);
  };

  const handleRemoveApiKey = () => {
    if (confirm('Bạn có chắc chắn muốn xóa API key?')) {
      localStorage.removeItem('gemini_api_key');
      setHasApiKey(false);
      setApiKey('');
      setIsModalOpen(true);
      onApiKeySet('');
    }
  };

  return (
    <>
      {/* API Key Status Bar */}
      {hasApiKey && (
        <div className="fixed bottom-3 right-5 z-50">
          <div className="bg-green-100 border border-green-300 text-green-800 px-3 py-2 rounded-lg shadow-sm flex items-center space-x-2 text-sm">
            <Key size={16} />
            <span>API key</span>
            <button
              onClick={handleChangeApiKey}
              className="text-green-600 hover:text-green-800 font-medium"
            >
              Thay đổi
            </button>
            <button
              onClick={handleRemoveApiKey}
              className="text-red-600 hover:text-red-800 font-medium ml-2"
            >
              Xóa
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Key className="mr-2" size={24} />
                  Cấu hình Gemini API Key
                </h2>
                {hasApiKey && (
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="apikey..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
                    <li>1. Truy cập <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Google AI Studio</a></li>
                    <li>2. Đăng nhập bằng tài khoản Google</li>
                    <li>3. Nhấn "Create API Key"</li>
                    <li>4. Sao chép và dán API key vào đây</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Lưu ý:</strong> API key sẽ được lưu trữ an toàn trong trình duyệt của bạn và không được chia sẻ với bất kỳ ai khác.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSaveApiKey}
                    disabled={!apiKey.trim()}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Save size={16} />
                    <span>Lưu API Key</span>
                  </button>
                  
                  {hasApiKey && (
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApiKeyForm;