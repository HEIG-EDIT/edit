import { Vector2d } from "konva/lib/types";
import { LayerId } from "./layer";
import { Line } from "./line";

export interface LayerProps {
  id: LayerId;
  position: Vector2d;
  rotation: number;
  scale: Vector2d;
  image: HTMLImageElement;
  isVisible: boolean;
  isSelected: boolean;
  lines: Line[];
}
