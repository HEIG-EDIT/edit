import { SubToolConfiguration } from "./subToolConfiguration";
import { ToolConfigurationProps } from "./toolConfigurationProps";

export type SubToolConfigurationProps<T extends SubToolConfiguration> =
  ToolConfigurationProps<T>;
