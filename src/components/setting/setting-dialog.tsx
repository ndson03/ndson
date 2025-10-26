"use client";
import React, { useState } from "react";
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
import { useTheme } from "@/src/hooks/use-theme";
import { useLanguage } from "@/src/hooks/use-language";
import { useTranslation } from "react-i18next";

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
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("settings.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* API Key Section */}
          <div className="space-y-2">
            <Label htmlFor="apikey" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              {t("settings.apiKey.label")}
            </Label>
            <div className="relative">
              <Input
                id="apikey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder={t("settings.apiKey.placeholder")}
                autoComplete="off"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
                aria-label={
                  showApiKey
                    ? t("settings.apiKey.hide")
                    : t("settings.apiKey.show")
                }
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
              <h4 className="font-medium mb-2">{t("settings.guide.title")}</h4>
              <ol className="space-y-1 text-muted-foreground">
                <li>
                  1. {t("settings.guide.step1")}{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    {t("settings.guide.step1Link")}
                  </a>
                </li>
                <li>2. {t("settings.guide.step2")}</li>
                <li>3. {t("settings.guide.step3")}</li>
                <li>4. {t("settings.guide.step4")}</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Theme Selection */}
          <div className="flex items-center justify-between">
            <Label htmlFor="theme" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {t("settings.theme.label")}
            </Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme" className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  {t("settings.theme.light")}
                </SelectItem>
                <SelectItem value="dark">{t("settings.theme.dark")}</SelectItem>
                <SelectItem value="system">
                  {t("settings.theme.system")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language Selection */}
          <div className="flex items-center justify-between">
            <Label htmlFor="language" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              {t("settings.language.label")}
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">{t("settings.language.vi")}</SelectItem>
                <SelectItem value="en">{t("settings.language.en")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingDialog;
