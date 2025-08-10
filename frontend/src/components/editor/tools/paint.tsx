// use https://casesandberg.github.io/react-color/

import { ChromePicker } from "react-color";
import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";

export interface PaintToolConfiguration extends ToolConfiguration {
  radius: number;
  color: string;
}

export const PaintToolConfigurationComponent = ({
  configuration,
  setConfiguration,
}: ToolConfigurationProps<PaintToolConfiguration>) => {
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

export const PAINT_TOOL: Tool<PaintToolConfiguration> = {
  name: "Paint",
  iconPath: "/editor/toolbar/paint.svg",
  initialConfiguration: { radius: 59, color: "#799ed2" },
  configurationComponent: PaintToolConfigurationComponent,
};
