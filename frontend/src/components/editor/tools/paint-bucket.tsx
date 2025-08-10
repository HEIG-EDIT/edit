import { SliderPicker } from "react-color";
import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";

export interface PaintBucketToolConfiguration extends ToolConfiguration {
  color: string;
}

export const PaintBucketToolConfigurationComponent = ({
  configuration,
  setConfiguration,
}: ToolConfigurationProps<PaintBucketToolConfiguration>) => {
  return (
    <div>
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

export const PAINT_BUCKET_TOOL: Tool<PaintBucketToolConfiguration> = {
  name: "Paint-bucket",
  iconPath: "/editor/toolbar/paint-bucket.svg",
  initialConfiguration: { color: "#e6b3b3" },
  configurationComponent: PaintBucketToolConfigurationComponent,
};
