import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        <div className="text-sm text-gray-800 dark:text-gray-200 mb-3 font-medium text-center">
          Xóa toàn bộ lịch sử chat?
        </div>
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleConfirm}
            className="px-3 py-1.5 text-xs rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-colors duration-150 cursor-pointer"
          >
            Xóa
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors duration-150 cursor-pointer"
          >
            Hủy
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
