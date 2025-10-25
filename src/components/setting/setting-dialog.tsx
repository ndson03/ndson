import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Key, Palette, Languages, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/src/hooks/use-language";

interface SettingDialogProps {
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SettingDialog: React.FC<SettingDialogProps> = ({
  apiKey,
  onApiKeyChange,
  isOpen,
  onClose,
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [theme, setTheme] = useState("system");
  const { language, setLanguage } = useLanguage();

  // Load theme preference on mount
  useEffect(() => {
    const storedTheme = sessionStorage.getItem("app_theme") || "system";
    setTheme(storedTheme);
  }, []);

  // Save theme preference
  useEffect(() => {
    sessionStorage.setItem("app_theme", theme);
  }, [theme]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cài đặt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* API Key Section */}
          <div className="space-y-2">
            <Label htmlFor="apikey" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Gemini API Key
            </Label>
            <div className="relative">
              <Input
                id="apikey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="Nhập API key của bạn..."
                autoComplete="off"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Guide */}
          <Alert>
            <AlertDescription className="text-sm">
              <h4 className="font-medium mb-2">
                Hướng dẫn lấy Gemini API Key:
              </h4>
              <ol className="space-y-1 text-muted-foreground">
                <li>
                  1. Truy cập{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    Google AI Studio
                  </a>
                </li>
                <li>2. Đăng nhập bằng tài khoản Google</li>
                <li>3. Nhấn "Create API Key"</li>
                <li>4. Sao chép và dán API key vào đây</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Theme Selection */}
          <div className="flex items-center justify-between">
            <Label htmlFor="theme" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Giao diện
            </Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme" className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Sáng</SelectItem>
                <SelectItem value="dark">Tối</SelectItem>
                <SelectItem value="system">Hệ thống</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language Selection */}
          <div className="flex items-center justify-between">
            <Label htmlFor="language" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Ngôn ngữ
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingDialog;
