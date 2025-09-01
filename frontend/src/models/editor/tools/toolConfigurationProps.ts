import { ToolConfiguration } from "./toolConfiguration";

/// Props passed to the ToolConfiguration components, manages the configuration values.
export interface ToolConfigurationProps<T extends ToolConfiguration> {
  configuration: T;
  setConfiguration: (config: T) => void;
}
