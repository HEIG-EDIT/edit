import { Tool } from "../../../app/konva/page";

export interface MoveToolConfiguration {}

interface MoveToolConfigurationProps {
  configuration: MoveToolConfiguration;
  setConfiguration: (config: MoveToolConfiguration) => void;
}

const MoveToolConfiguration: React.FC<MoveToolConfigurationProps> = ({
  configuration,
  setConfiguration,
}) => {
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfiguration({ ...configuration, radius: Number(e.target.value) });
  };

  const handleColorChange = (color: any) => {
    setConfiguration({ ...configuration, color: color.hex });
  };

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
  name: "move",
  iconPath: "/editor/toolbar/move.svg",
  initialConfiguration: {},
  configurationComponent: MoveToolConfiguration,
};
