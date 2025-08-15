import { Layer, LayerId, LayerUpdateCallback } from "./layer";

export type LayersManagementProps = {
  layers: Layer[];
  updateLayer: (id: LayerId, callback: LayerUpdateCallback) => void;
};
