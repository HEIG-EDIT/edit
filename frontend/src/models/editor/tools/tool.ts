import { ReactNode } from "react";
import { ToolConfiguration } from "./toolConfiguration";
import { ToolConfigurationProps } from "./toolConfigurationProps";
import { KonvaMouseEvent } from "../utils/events";

export interface Tool<T extends ToolConfiguration> {
  name: string;
  icon: ReactNode;
  initialConfiguration: T;
  configurationComponent: React.FC<ToolConfigurationProps<T>>;

  handleMouseDown?: (event: KonvaMouseEvent) => void,
  handleMouseMove?: (event: KonvaMouseEvent) => void,
  handleMouseUp?: (event: KonvaMouseEvent) => void,
}
