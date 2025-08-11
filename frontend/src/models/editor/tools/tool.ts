import { ReactNode } from "react";
import { ToolConfiguration } from "./toolConfiguration";
import { ToolConfigurationProps } from "./toolConfigurationProps";

export interface Tool<T extends ToolConfiguration> {
  name: string;
  icon: ReactNode;
  initialConfiguration: T;
  configurationComponent: React.FC<ToolConfigurationProps<T>>;
}
