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
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-[105px] left-1/2 transform -translate-x-1/2 
                 bg-white border border-gray-200 rounded-full p-1.5 shadow-lg 
                 hover:bg-gray-50 transition-all duration-300 z-10 
                 flex items-center justify-center cursor-pointer
                 ${
                   isVisible
                     ? "opacity-100 translate-y-0"
                     : "opacity-0 translate-y-2 pointer-events-none"
                 }`}
      aria-label="Scroll to bottom"
    >
      <ArrowDown size={20} className="text-gray-700" />
    </button>
  );
};
