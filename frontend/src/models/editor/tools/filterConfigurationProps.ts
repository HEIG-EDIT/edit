import { FilterConfiguration } from "./filterConfiguration";
import { ToolConfigurationProps } from "./toolConfigurationProps";

export type FilterConfigurationProps<T extends FilterConfiguration> =
  ToolConfigurationProps<T>;
