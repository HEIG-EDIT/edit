import { FilterConfiguration } from "./filterConfiguration";
import { ToolConfigurationProps } from "./toolConfigurationProps";

/// Props passed to the Configuration component for a filter of the adjust tool.
/// Includes at least callback functions to read and edit the filter's configuration
export type FilterConfigurationProps<T extends FilterConfiguration> =
  ToolConfigurationProps<T>;
