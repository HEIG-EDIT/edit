import { Vector2d } from "konva/lib/types";
import { Layer, LayerId, LayerUpdateCallback } from "./layer";

/// Props passed to the layer management component, i.e. the component at the
/// left of the editor showing the current layers of the canvas.
export interface LayersManagementProps {
  layers: Layer[];
  updateLayer: (
    id: LayerId,
    callback: LayerUpdateCallback,
    virtual?: boolean,
  ) => void;
  canvasSize: Vector2d;
}
