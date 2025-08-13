import { SliderPicker } from "react-color";
import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";
import FormatColorFillRoundedIcon from "@mui/icons-material/FormatColorFillRounded";

export interface PaintBucketToolConfiguration extends ToolConfiguration {
  color: string;
}

export const PaintBucketToolConfigurationComponent = ({
  configuration,
  setConfiguration,
}: ToolConfigurationProps<PaintBucketToolConfiguration>) => {
  return (
    <div>
      <p className="text-violet-50">
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

export const PAINT_BUCKET_TOOL: Tool<PaintBucketToolConfiguration> = {
  name: "Paint-bucket",
  icon: <FormatColorFillRoundedIcon style={{ color: "white" }} />,
  initialConfiguration: { color: "#e6b3b3" },
  configurationComponent: PaintBucketToolConfigurationComponent,
};
