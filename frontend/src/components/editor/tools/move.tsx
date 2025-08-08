import { Tool, ToolConfiguration } from "@/app/editor/page";

export interface MoveToolConfiguration {}

interface Props {
  configuration: MoveToolConfiguration;
  setConfiguration: (config: MoveToolConfiguration) => void;
}

const MoveToolConfigurationComponent: React.FC<Props> = ({
  configuration,
  setConfiguration,
}) => {
  return (
    <div>
      <p className="text-violet-50 text-lg">
        {" "}
        No configuration available for this tool!
      </p>
    </div>
  );
};

export const MoveTool: Tool = {
  name: "Move",
  iconPath: "/editor/toolbar/move.svg",
  initialConfiguration: {},
  configurationComponent: MoveToolConfigurationComponent as React.FC<{
    configuration: ToolConfiguration;
    setConfiguration: (config: ToolConfiguration) => void;
  }>,
};
