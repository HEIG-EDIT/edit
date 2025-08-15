import { Layer, LayerId, LayerUpdateCallback } from "./layer";

export interface LayersManagementProps {
  layers: Layer[];
  updateLayer: (id: LayerId, callback: LayerUpdateCallback) => void;
}
