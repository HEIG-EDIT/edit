import { Tool, ToolConfiguration } from "../../../app/konva/page";

export interface EraseToolConfiguration {
  radius: number;
}

interface EraseToolConfigurationProps {
  configuration: EraseToolConfiguration;
  setConfiguration: (config: EraseToolConfiguration) => void;
}

const EraseToolConfiguration: React.FC<EraseToolConfigurationProps> = ({
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
    </div>
  );
};

export const EraseTool: Tool = {
  name: "erase",
  iconPath: "/editor/toolbar/erase.svg",
  initialConfiguration: { radius: 10 },
  configurationComponent: EraseToolConfiguration as React.FC<{
    configuration: ToolConfiguration;
    setConfiguration: (config: ToolConfiguration) => void;
  }>,
};
