import { FilterConfiguration } from "./filterConfiguration";
import { FilterConfigurationProps } from "./filterConfigurationProps";

export interface Filter<T extends FilterConfiguration> {
  name: string;
  initialConfiguration: T;
  configurationComponent: React.FC<FilterConfigurationProps<T>>;
}
