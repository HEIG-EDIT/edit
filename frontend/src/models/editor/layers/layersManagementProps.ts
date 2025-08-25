import { Vector2d } from "konva/lib/types";
import { Layer, LayerId, LayerUpdateCallback } from "./layer";

export interface LayersManagementProps {
  layers: Layer[];
  updateLayer: (
    id: LayerId,
    callback: LayerUpdateCallback,
    virtual?: boolean,
  ) => void;
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  canvasSize: Vector2d;
}
