import { ToolConfiguration } from "./toolConfiguration";

export interface ToolConfigurationProps<T extends ToolConfiguration> {
  configuration: T;
  setConfiguration: (config: T) => void;
}
