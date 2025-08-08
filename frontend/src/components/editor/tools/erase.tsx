import { Tool, ToolConfiguration } from "@/app/editor/page";

export interface EraseToolConfiguration {
  radius: number;
}

interface Props {
  configuration: EraseToolConfiguration;
  setConfiguration: (config: EraseToolConfiguration) => void;
}

const EraseToolConfigurationComponent: React.FC<Props> = ({
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
  name: "Erase",
  iconPath: "/editor/toolbar/erase.svg",
  initialConfiguration: { radius: 10 },
  configurationComponent: EraseToolConfigurationComponent as React.FC<{
    configuration: ToolConfiguration;
    setConfiguration: (config: ToolConfiguration) => void;
  }>,
};
