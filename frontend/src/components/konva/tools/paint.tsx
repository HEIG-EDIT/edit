// use https://casesandberg.github.io/react-color/

import { SliderPicker } from "react-color";
import { Tool } from "../../../app/konva/page";

export interface PaintToolConfiguration {
  radius: number;
  color: string;
}

interface PaintToolConfigurationProps {
  configuration: PaintToolConfiguration;
  setConfiguration: (config: PaintToolConfiguration) => void;
}

const PaintToolConfiguration: React.FC<PaintToolConfigurationProps> = ({
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
      <SliderPicker
        color={configuration.color}
        onChangeComplete={(color) => {
          setConfiguration({ ...configuration, color: color.hex });
        }}
      />
    </div>
  );
};

export const PaintTool: Tool = {
  name: "paint",
  iconPath: "/editor/toolbar/paint.svg",
  initialConfiguration: { radius: 59, color: "#799ed2" },
  configurationComponent: PaintToolConfiguration,
};
