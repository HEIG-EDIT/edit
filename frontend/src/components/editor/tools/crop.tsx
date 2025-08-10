import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";

export interface CropToolConfiguration extends ToolConfiguration {}

export const CropToolConfigurationComponent = ({
  configuration,
  setConfiguration,
}: ToolConfigurationProps<CropToolConfiguration>) => {
  return (
    <p className="text-violet-50 text-lg">
      {" "}
      No configuration available for this tool!
    </p>
  );
};

export const CROP_TOOL: Tool<CropToolConfiguration> = {
  name: "Crop",
  iconPath: "/editor/toolbar/crop.svg",
  initialConfiguration: {},
  configurationComponent: CropToolConfigurationComponent,
};
