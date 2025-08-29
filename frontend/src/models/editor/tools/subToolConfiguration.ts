import { Layer } from "@/models/editor/layers/layer";
import { ToolConfiguration } from "./toolConfiguration";

export interface SubToolConfiguration extends ToolConfiguration {
  applyTool: (layer: Layer) => Layer;
};
