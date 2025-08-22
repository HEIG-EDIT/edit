import { TOOLS } from "@/models/editor/utils/tools";
import { ActionButton } from "@/components/actionButton";
import { Dispatch, SetStateAction } from "react";

export interface ToolSelectorProps {
  nameSelectedTool: string;
  setNameSelectedTool: Dispatch<SetStateAction<string>>;
}

export const ToolSelector = ({
  nameSelectedTool,
  setNameSelectedTool,
}: ToolSelectorProps) => {
  return (
    <div className="flex gap-4">
      {Object.keys(TOOLS).map((key) => {
        const isSelected = TOOLS[key].name === nameSelectedTool;
        const style = isSelected
          ? "bg-violet-500 border-violet-50"
          : "bg-gray-900 border-violet-500";
        return (
          <div key={TOOLS[key].name}>
            <ActionButton
              icon={TOOLS[key].icon}
              onClick={() => setNameSelectedTool(TOOLS[key].name)}
              style={style}
            />
          </div>
        );
      })}
    </div>
  );
};
