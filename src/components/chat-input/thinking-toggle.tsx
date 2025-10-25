import React from "react";
import { Plus, X, Lightbulb, LightbulbOff } from "lucide-react";

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
  const isProModel = selectedModel.toLowerCase().includes("gemini-2.5-pro");
  const isDisabled = isProModel;

  const handleClick = () => {
    if (!isDisabled) onToggle();
  };

  const buttonClasses = [
    "thinking-toggle group inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-full transition-all duration-200 select-none",
    isProModel
      ? "text-blue-600 dark:text-blue-400 cursor-default"
      : enabled
      ? "cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
      : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
  ].join(" ");

  const textClasses = [
    "text-sm leading-none transition-colors duration-200 hidden md:inline-block",
    isProModel || enabled
      ? "text-blue-600 dark:text-blue-400"
      : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100",
  ].join(" ");

  const renderIcon = () => {
    const iconProps = { size: 16, strokeWidth: 2 };

    if (isProModel) {
      return (
        <Lightbulb
          {...iconProps}
          className="text-blue-600 dark:text-blue-400"
        />
      );
    }

    if (enabled) {
      return (
        <>
          <Lightbulb
            {...iconProps}
            className="block group-hover:hidden text-blue-600 dark:text-blue-400"
          />
          <X
            {...iconProps}
            className="hidden group-hover:block text-blue-600 dark:text-blue-400"
          />
        </>
      );
    }

    return (
      <>
        <LightbulbOff
          {...iconProps}
          className="block group-hover:hidden text-gray-600 dark:text-gray-400 transition-colors group-hover:text-gray-900 dark:group-hover:text-gray-100"
        />
        <Plus
          {...iconProps}
          className="hidden group-hover:block text-gray-600 dark:text-gray-400 transition-colors group-hover:text-gray-900 dark:group-hover:text-gray-100"
        />
      </>
    );
  };

  const iconWrapperClasses = [
    "flex items-center justify-center w-5 h-5 rounded-full transition-all duration-200",
    !isProModel && !enabled
      ? "group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
      : !isProModel && enabled
      ? "group-hover:bg-blue-100 dark:group-hover:bg-blue-900"
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
      <span className={textClasses}>Thinking Mode</span>
    </button>
  );
};
