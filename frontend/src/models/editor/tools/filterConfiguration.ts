import { Layer } from "@/models/editor/layers/layer";
import { ToolConfiguration } from "./toolConfiguration";

/// Base abstract Configuration type for a filter of the adjust tool.
export interface FilterConfiguration extends ToolConfiguration {
  applyTool: (layer: Layer, configuration: FilterConfiguration) => Layer;
}
