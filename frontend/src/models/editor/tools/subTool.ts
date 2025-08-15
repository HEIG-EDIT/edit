import { SubToolConfiguration } from "./subToolConfiguration";
import { SubToolConfigurationProps } from "./subToolConfigurationProps";

export interface SubTool<T extends SubToolConfiguration> {
  name: string;
  initialConfiguration: T;
  configurationComponent: React.FC<SubToolConfigurationProps<T>>;
}
