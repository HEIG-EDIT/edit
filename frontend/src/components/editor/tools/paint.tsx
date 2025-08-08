// use https://casesandberg.github.io/react-color/

import { ChromePicker } from "react-color";
import { Tool, ToolConfiguration } from "@/app/editor/page";

export interface PaintToolConfiguration {
  radius: number;
  color: string;
}

interface Props {
  configuration: PaintToolConfiguration;
  setConfiguration: (config: PaintToolConfiguration) => void;
}

const PaintToolConfigurationComponent: React.FC<Props> = ({
  configuration,
  setConfiguration,
}) => {
  return (
    <div>
      <p className="text-violet-50 text-lg">
        Radius :<br></br>
      </p>
      <input
        type="range"
        min="1"
        max="100"
        value={configuration.radius}
        onChange={(e) => {
          setConfiguration({
            ...configuration,
            radius: Number(e.target.value),
          });
        }}
      />
      <span className="text-violet-50 text-lg"> {configuration.radius}</span>
      <p className="text-violet-50 text-lg">
        Color :<br></br>
      </p>
      <ChromePicker
        color={configuration.color}
        onChangeComplete={(color) => {
          setConfiguration({ ...configuration, color: color.hex });
        }}
        disableAlpha={true}
      />
    </div>
  );
};

export const PaintTool: Tool = {
  name: "Paint",
  iconPath: "/editor/toolbar/paint.svg",
  initialConfiguration: { radius: 59, color: "#799ed2" },
  configurationComponent: PaintToolConfigurationComponent as React.FC<{
    configuration: ToolConfiguration;
    setConfiguration: (config: ToolConfiguration) => void;
  }>,
};
