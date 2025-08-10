import { TOOLS } from "@/app/editor/page";
import { Dispatch, SetStateAction } from "react";
import Image from "next/image";

type ToolSelectorProps = {
  nameSelectedTool: string;
  setNameSelectedTool: Dispatch<SetStateAction<string>>;
};

export const ToolSelector = ({
  nameSelectedTool,
  setNameSelectedTool,
}: ToolSelectorProps) => {
  return (
    <div className="flex gap-2">
      {Object.keys(TOOLS).map((key) => {
        const isSelected = TOOLS[key].name === nameSelectedTool;
        const style = isSelected
          ? "bg-violet-500 border-violet-50"
          : "bg-gray-900 border-violet-500";

        return (
          <button
            className={`rounded-xl border-2 p-2 ${style}`}
            key={key}
            onClick={() => setNameSelectedTool(TOOLS[key].name)}
          >
            {/* TODO : utiliser icon et pas Image */}
            <Image
              src={TOOLS[key].iconPath}
              alt={`Icon of tool ${TOOLS[key].name}`}
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
