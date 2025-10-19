import React from "react";

export const LoadingMessage: React.FC = () => {
  return (
    <div className="flex justify-start animate-[fadeIn_0.3s_ease-in]">
      <div className="flex items-center gap-1 py-1">
        <div className="relative w-12 h-12 flex-shrink-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6">
            <img
              src="/galaxyai-galaxy-ai.gif"
              alt="icon"
              className="w-full h-full"
            />
          </div>
        </div>
        <span>Vui lòng chờ trong giây lát...</span>
      </div>
    </div>
  );
};
