import { ReactNode } from "react";
import { ToolConfiguration } from "./toolConfiguration";
import { ToolConfigurationProps } from "./toolConfigurationProps";
import { KonvaMouseEvent } from "../utils/events";

/// Generic type to hold the tools logic. Each tool is defined as a constant of this type
/// @tparam T The type of the tool's configuration, may be empty if the tool cannot be configured
export interface Tool<T extends ToolConfiguration> {
  /// The name of the tool
  name: string;
  /// The icon for the tool in the toolbar
  icon: ReactNode;
  /// The initial configuration of the tool
  initialConfiguration: T;
  /// The component showing the UI of the tool's configuration
  configurationComponent: React.FC<ToolConfigurationProps<T>>;

  /// Optional event handlers holding the logic of the tool, these are used for
  /// mouse events on the canvas, which not all tools use.
  handleMouseDown?: (event: KonvaMouseEvent) => void;
  handleMouseMove?: (event: KonvaMouseEvent) => void;
  handleMouseUp?: (event: KonvaMouseEvent) => void;
}
