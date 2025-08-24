// use https://casesandberg.github.io/react-color/

import { ChromePicker } from "react-color";
import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";
import BrushRoundedIcon from "@mui/icons-material/BrushRounded";
import { PaintEraseBaseComponent } from "./paintEraseBase";
import { RangeInput } from "./rangeInput";

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
      <PaintEraseBaseComponent<PaintToolConfiguration>
        toolConfiguration={{ configuration, setConfiguration }}
      />
      <RangeInput
        property="Radius"
        value={configuration.radius}
        onChange={(newRadius) =>
          setConfiguration({ ...configuration, radius: newRadius })
        }
      />
      <span className="text-violet-50"> {configuration.radius}</span>
      <p className="text-violet-50">
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
  icon: <BrushRoundedIcon style={{ color: "white" }} />,
  initialConfiguration: { radius: 59, color: "#799ed2" },
  configurationComponent: PaintToolConfigurationComponent,
};
