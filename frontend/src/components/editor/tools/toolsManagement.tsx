import { TOOLS } from "@/models/editor/utils/tools";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import { Dispatch, SetStateAction } from "react";

export interface ToolsManagementProps {
  nameSelectedTool: string;
  toolsConfiguration: Record<string, ToolConfiguration>;
  setToolsConfiguration: Dispatch<
    SetStateAction<Record<string, ToolConfiguration>>
  >;
}

export const ToolsManagement = ({
  nameSelectedTool,
  toolsConfiguration,
  setToolsConfiguration,
}: ToolsManagementProps) => {
  const ToolConfigurationComponent =
    TOOLS[nameSelectedTool].configurationComponent;

  return (
    <div className="bg-gray-800 rounded-2xl">
      <div className="bg-violet-300 rounded-2xl p-2 flex flex-row gap-2 mb-2">
        <ConstructionRoundedIcon />
        <p className="text-grey-800 font-semibold">Tool configuration</p>
      </div>
      <div className="p-4">
        <div className="bg-gray-600 rounded-2xl">
          <p className="text-violet-50 font-bold flex justify-center pt-2">
            {nameSelectedTool}
          </p>
          <div className="p-2">
            <ToolConfigurationComponent
              configuration={toolsConfiguration[nameSelectedTool]}
              setConfiguration={(config: ToolConfiguration) =>
                setToolsConfiguration((prev) => ({
                  ...prev,
                  [nameSelectedTool]: config,
                }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
