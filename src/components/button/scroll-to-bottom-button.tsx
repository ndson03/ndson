import React from "react";
import { ArrowDown } from "lucide-react";

interface ScrollToBottomButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  onClick,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-[105px] left-1/2 transform -translate-x-1/2 
                 bg-white border border-gray-200 rounded-full p-1.5 shadow-lg 
                 hover:bg-gray-50 transition-all duration-200 z-10 
                 flex items-center justify-center cursor-pointer"
      aria-label="Scroll to bottom"
    >
      <ArrowDown size={20} className="text-gray-700" />
    </button>
  );
};
