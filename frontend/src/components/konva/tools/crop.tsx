import { Tool } from "../../../app/konva/page";

export interface CropToolConfiguration {}

interface CropToolConfigurationProps {
  configuration: CropToolConfiguration;
  setConfiguration: (config: CropToolConfiguration) => void;
}

const CropToolConfiguration: React.FC<CropToolConfigurationProps> = ({
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
  name: "crop",
  iconPath: "/editor/toolbar/crop.svg",
  initialConfiguration: {},
  configurationComponent: CropToolConfiguration,
};
