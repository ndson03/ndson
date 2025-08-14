import React, { useEffect, useRef, useState } from "react";

interface DeletePopupProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  targetElement: HTMLElement | null;
}

export const DeletePopup: React.FC<DeletePopupProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  targetElement,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && targetElement && popupRef.current) {
      const targetRect = targetElement.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();

      const left = targetRect.left + targetRect.width / 2 - popupRect.width / 2;
      const top = targetRect.top - popupRect.height - 12;

      setPosition({
        left: Math.max(8, Math.min(left, window.innerWidth - popupRect.width - 8)),
        top: Math.max(8, top),
      });
    }
  }, [isOpen, targetElement]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onCancel} />
      <div
        ref={popupRef}
        className="fixed z-50 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`,
        }}
      >
        <div className="p-3 min-w-[200px]">
          <div className="text-sm text-gray-800 dark:text-gray-200 mb-3 font-medium flex justify-center">
            Xóa toàn bộ lịch sử chat?
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onConfirm}
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
        </div>
        <div
          className="absolute top-full left-1/2 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid white",
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.05))",
          }}
        />
      </div>
    </>
  );
};