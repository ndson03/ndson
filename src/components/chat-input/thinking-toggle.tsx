import React from "react";
import { Plus, X, Brain } from "lucide-react";

interface ThinkingToggleProps {
  enabled: boolean;
  onToggle: () => void;
  selectedModel: string;
}

export const ThinkingToggle: React.FC<ThinkingToggleProps> = ({
  enabled,
  onToggle,
  selectedModel,
}) => {
  const activeColor = "#0285ff";

  const isProModel = selectedModel.toLowerCase().includes("gemini-2.5-pro");
  const isDisabled = isProModel;

  const handleClick = () => {
    if (!isDisabled) onToggle();
  };

  /** Button style */
  const buttonClasses = [
    "thinking-toggle group inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-full transition-all duration-200 select-none",
    isProModel
      ? "bg-[#f5f9ff] text-[#0A84FF] cursor-default"
      : enabled
      ? "cursor-pointer hover:bg-[#f5f9ff]"
      : "cursor-pointer hover:bg-gray-100",
  ].join(" ");

  /** Text style */
  const textClasses = [
    "text-sm leading-none transition-colors duration-200",
    isProModel || enabled
      ? "text-[#0285ff]"
      : "text-gray-400 group-hover:text-gray-600",
  ].join(" ");

  /** Icon render logic */
  const renderIcon = () => {
    const iconProps = { size: 16, strokeWidth: 2 };

    if (isProModel) return <Brain {...iconProps} color={activeColor} />;

    if (enabled)
      return (
        <>
          <Brain
            {...iconProps}
            color={activeColor}
            className="block group-hover:hidden"
          />
          <X
            {...iconProps}
            color={activeColor}
            className="hidden group-hover:block"
          />
        </>
      );

    return (
      <Plus
        {...iconProps}
        className="text-gray-400 transition-colors group-hover:text-gray-600"
      />
    );
  };

  /** Icon container background */
  const iconWrapperClasses = [
    "flex items-center justify-center w-5 h-5 rounded-full transition-all duration-200",
    !isProModel && !enabled
      ? "group-hover:bg-gray-200"
      : !isProModel && enabled
      ? "group-hover:bg-[#cce6ff]"
      : "",
  ].join(" ");

  return (
    <button
      onClick={handleClick}
      className={buttonClasses}
      disabled={isDisabled}
      aria-pressed={enabled}
    >
      <div className={iconWrapperClasses}>{renderIcon()}</div>
      <span className={textClasses}>Nghĩ sâu</span>
    </button>
  );
};
