import { Vector2d } from "konva/lib/types";
import { LayerId, LayerUpdateCallback } from "./layer";
import { Line } from "./line";

export interface TransformDiff {
  scale: Vector2d;
  position: Vector2d;
  rotation: number;
}

export interface LayerProps {
  id: LayerId;
  position: Vector2d;
  rotation: number;
  scale: Vector2d;
  image: HTMLImageElement;
  isVisible: boolean;
  isSelected: boolean;
  lines: Line[];
  updateLayer: (callback: LayerUpdateCallback, virtual: boolean) => void;
}
