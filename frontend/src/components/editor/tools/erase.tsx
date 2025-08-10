import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";

export interface EraseToolConfiguration extends ToolConfiguration {
  radius: number;
}

export const EraseToolConfigurationComponent = ({
  configuration,
  setConfiguration,
}: ToolConfigurationProps<EraseToolConfiguration>) => {
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

export const ERASE_TOOL: Tool<EraseToolConfiguration> = {
  name: "Erase",
  iconPath: "/editor/toolbar/erase.svg",
  initialConfiguration: { radius: 10 },
  configurationComponent: EraseToolConfigurationComponent,
};
