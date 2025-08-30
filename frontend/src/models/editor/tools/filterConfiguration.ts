import { Layer } from "@/models/editor/layers/layer";
import { ToolConfiguration } from "./toolConfiguration";

export interface FilterConfiguration extends ToolConfiguration {
  applyTool: (layer: Layer, configuration: FilterConfiguration) => Layer;
};
