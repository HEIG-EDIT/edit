import { SliderPicker } from "react-color";
import { Tool } from "../../../app/konva/page";

export interface PaintBucketToolConfiguration {
  color: string;
}

interface PaintBucketToolConfigurationProps {
  configuration: PaintBucketToolConfiguration;
  setConfiguration: (config: PaintBucketToolConfiguration) => void;
}

const PaintBucketToolConfiguration: React.FC<
  PaintBucketToolConfigurationProps
> = ({ configuration, setConfiguration }) => {
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
  name: "paint-bucket",
  iconPath: "/editor/toolbar/paint-bucket.svg",
  initialConfiguration: { color: "#e6b3b3" },
  configurationComponent: PaintBucketToolConfiguration,
};
