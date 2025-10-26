import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  return (
    <Select value={selectedModelId} onValueChange={onModelSelect}>
      <SelectTrigger className="shadow-none rounded-full border-0 bg- hover:bg-secondary focus:ring-0 focus:ring-offset-0 [&>svg]:transition-transform [&>svg]:duration-200 data-[state=open]:[&>svg]:rotate-180">
        <SelectValue>
          <span className="text-sm">
            {selectedModel?.name || selectedModelId}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-64" align="start">
        {models.map((model) => (
          <SelectItem
            key={model.id}
            value={model.id}
            className="cursor-pointer"
          >
            <div className="flex flex-col items-start">
              <span className="font-medium text-sm">{model.name}</span>
              {model.description && (
                <span className="text-xs text-muted-foreground mt-0.5">
                  {model.description}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
