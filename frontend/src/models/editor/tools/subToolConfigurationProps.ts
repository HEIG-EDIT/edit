import { SubToolConfiguration } from "./subToolConfiguration";
import { ToolConfigurationProps } from "./toolConfigurationProps";

export interface SubToolConfigurationProps<T extends SubToolConfiguration>
  extends ToolConfigurationProps<T> {}
