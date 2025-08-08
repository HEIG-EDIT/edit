import { SliderPicker } from "react-color";
import { Tool, ToolConfiguration } from "@/app/editor/page";

export interface PaintBucketToolConfiguration {
  color: string;
}

interface Props {
  configuration: PaintBucketToolConfiguration;
  setConfiguration: (config: PaintBucketToolConfiguration) => void;
}

const PaintBucketToolConfigurationComponent: React.FC<Props> = ({
  configuration,
  setConfiguration,
}) => {
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

export const PaintBucketTool: Tool = {
  name: "Paint-bucket",
  iconPath: "/editor/toolbar/paint-bucket.svg",
  initialConfiguration: { color: "#e6b3b3" },
  configurationComponent: PaintBucketToolConfigurationComponent as React.FC<{
    configuration: ToolConfiguration;
    setConfiguration: (config: ToolConfiguration) => void;
  }>,
};
