import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

interface DeletePopupProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

export const DeletePopup: React.FC<DeletePopupProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  children,
}) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[200px] p-3"
        align="center"
        sideOffset={8}
      >
        <div className="text-sm text-foreground mb-3 font-medium text-center">
          {t("messages.deleteConfirm")}
        </div>
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleConfirm}
            className="px-3 py-1.5 text-xs rounded-md text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors duration-150 cursor-pointer"
          >
            {t("delete")}
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors duration-150 cursor-pointer"
          >
            {t("cancel")}
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
