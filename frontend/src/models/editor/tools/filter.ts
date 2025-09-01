import { FilterConfiguration } from "./filterConfiguration";
import { FilterConfigurationProps } from "./filterConfigurationProps";

/// The interface for individual filters of the adjust tool.
/// @tparam T The type of the configuration for the filter, including at least an
///           applyTool callback with the layer transformation logic of the tool.
export interface Filter<T extends FilterConfiguration> {
  name: string;
  initialConfiguration: T;
  configurationComponent: React.FC<FilterConfigurationProps<T>>;
}
