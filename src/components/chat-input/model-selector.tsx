import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Model } from "@/src/types";

interface ModelSelectorProps {
  selectedModelId: string;
  selectedModel?: Model;
  models: Model[];
  onModelSelect: (modelId: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  selectedModel,
  models,
  onModelSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 sm:h-8 px-2 rounded-full hover:bg-secondary text-muted-foreground font-medium model-selector"
        >
          <span className="text-sm">
            {selectedModel?.name || selectedModelId}
          </span>
          <ChevronDown
            size={14}
            className={`ml-1 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64" sideOffset={8}>
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => {
              onModelSelect(model.id);
              setIsOpen(false);
            }}
            className={`flex flex-row items-center justify-between cursor-pointer ${
              selectedModelId === model.id
                ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                : ""
            }`}
          >
            <div className="flex flex-col items-start">
              <span className="font-medium text-sm">{model.name}</span>
              {model.description && (
                <span className="text-xs text-muted-foreground mt-0.5">
                  {model.description}
                </span>
              )}
            </div>
            {selectedModelId === model.id && (
              <Check
                size={16}
                className="text-blue-700 dark:text-blue-400 flex-shrink-0 ml-2"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
