import { Vector2d } from "konva/lib/types";
import { FiltersConfig, LayerId, LayerUpdateCallback } from "./layer";
import { Line } from "./line";
import { Filter } from "konva/lib/Node";

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
  size: Vector2d;
  isVisible: boolean;
  isSelected: boolean;
  lines: Line[];
  filters: Filter[];
  filtersConfig: FiltersConfig;
  updateLayer: (callback: LayerUpdateCallback, virtual: boolean) => void;
  nameSelectedTool: string;
}
