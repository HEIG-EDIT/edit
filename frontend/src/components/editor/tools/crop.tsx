import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";
import CropRoundedIcon from "@mui/icons-material/CropRounded";

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
  icon: <CropRoundedIcon style={{ color: "white" }} />,
  initialConfiguration: {},
  configurationComponent: CropToolConfigurationComponent,
};
