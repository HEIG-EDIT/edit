import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";
import OpenWithRoundedIcon from "@mui/icons-material/OpenWithRounded";

export type MoveToolConfiguration = ToolConfiguration;

export const MoveToolConfigurationComponent = ({
  configuration,
  setConfiguration,
}: ToolConfigurationProps<MoveToolConfiguration>) => {
  // TODO : to remove, just for eslink check
  console.log(configuration);
  console.log(setConfiguration);

  return (
    <div>
      <p className="text-violet-50">
        {" "}
        No configuration available for this tool!
      </p>
    </div>
  );
};

export const MOVE_TOOL: Tool<MoveToolConfiguration> = {
  name: "Move",
  icon: <OpenWithRoundedIcon style={{ color: "white" }} />,
  initialConfiguration: {},
  configurationComponent: MoveToolConfigurationComponent,
};
