import { Vector2d } from "konva/lib/types";
import { Layer, LayerId, LayerUpdateCallback } from "./layer";

export interface LayersManagementProps {
  layers: Layer[];
  updateLayer: (
    id: LayerId,
    callback: LayerUpdateCallback,
    virtual?: boolean,
  ) => void;
  canvasSize: Vector2d;
}
