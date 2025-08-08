import { Tool, ToolConfiguration } from "@/app/editor/page";

export interface CropToolConfiguration {}

interface Props {
  configuration: CropToolConfiguration;
  setConfiguration: (config: CropToolConfiguration) => void;
}

const CropToolConfigurationComponent: React.FC<Props> = ({
  configuration,
  setConfiguration,
}) => {
  return (
    <p className="text-violet-50 text-lg">
      {" "}
      No configuration available for this tool!
    </p>
  );
};

export const CropTool: Tool = {
  name: "Crop",
  iconPath: "/editor/toolbar/crop.svg",
  initialConfiguration: {},
  configurationComponent: CropToolConfigurationComponent as React.FC<{
    configuration: ToolConfiguration;
    setConfiguration: (config: ToolConfiguration) => void;
  }>,
};
