import { Vector2d } from "konva/lib/types";
import { FiltersConfig, LayerId, LayerUpdateCallback } from "./layer";
import { Line } from "./line";
import { Filter } from "konva/lib/Node";

/// Differences of certain layer attributes applied by a Konva transformer (move tool)
export interface TransformDiff {
  scale: Vector2d;
  position: Vector2d;
  rotation: number;
}

/// Props passed to layer rendering components, i.e. the layers visible on the app's canvas.
export interface LayerProps {
  id: LayerId;
  position: Vector2d;
  rotation: number;
  scale: Vector2d;
  image: HTMLImageElement;
  size: Vector2d;
  isVisible: boolean;
  isSelected: boolean;
  lines: Line[];
  filters: Filter[];
  filtersConfig: FiltersConfig;
  updateLayer: (callback: LayerUpdateCallback, virtual: boolean) => void;
  nameSelectedTool: string;
}
