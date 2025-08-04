import { Tools, Tool } from "../../app/konva/page";
import { Dispatch, SetStateAction } from "react";
import Image from "next/image";

type ToolSelectorProps = {
  selectedTool: Tool;
  setSelectedTool: Dispatch<SetStateAction<Tool>>;
};

export const ToolSelector = ({
  selectedTool,
  setSelectedTool,
}: ToolSelectorProps) => {
  return (
    <div className="flex gap-2">
      {Object.keys(Tools).map((key) => {
        const isSelected = Tools[key] === selectedTool;
        const style = isSelected
          ? "bg-violet-500 border-violet-50"
          : "bg-gray-900 border-violet-500";

        return (
          <button
            className={`rounded-xl border-2 p-2 ${style}`}
            key={key}
            onClick={() => setSelectedTool(Tools[key])}
          >
            <Image
              src={Tools[key].iconPath}
              alt={`Icon of tool ${Tools[key].name}`}
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto"
            />
          </button>
        );
      })}
    </div>
  );
};
