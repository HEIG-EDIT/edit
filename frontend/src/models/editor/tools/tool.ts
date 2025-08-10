import { ToolConfiguration } from "./toolConfiguration";
import { ToolConfigurationProps } from "./toolConfigurationProps";

export interface Tool<T extends ToolConfiguration> {
  name: string;
  iconPath: string;
  initialConfiguration: T;
  configurationComponent: React.FC<ToolConfigurationProps<T>>;
}
