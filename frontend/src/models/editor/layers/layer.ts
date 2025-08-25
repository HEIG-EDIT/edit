import { Vector2d } from "konva/lib/types";
import { createRef, RefObject } from "react";
import { Line } from "./line";
import Konva from "konva";

export type LayerId = string;

export class Layer {
  name: string;
  id: LayerId; // UUID
  imageData: ImageData | null = null;
  image: HTMLImageElement;
  isSelected: boolean = false;

  // Refs to the underlying Konva components
  groupRef: RefObject<Konva.Group | null>;

  isVisible: boolean = true;
  position: Vector2d = {
    x: 0,
    y: 0,
  };
  positionBeforeDrag: Vector2d = {
    x: 0,
    y: 0,
  };
  scale: Vector2d = {
    x: 1,
    y: 1,
  };
  rotation: number = 0;
  lines: Array<Line> = []; // Lines drawn free-hand on a Layer

  size: Vector2d;

  constructor(
    name: string | null = null,
    image: HTMLImageElement | null = null,
    width: number = 0,
    height: number = 0,
  ) {
    this.id = crypto.randomUUID();
    this.groupRef = createRef();

    if (name) {
      this.name = name;
    } else {
      this.name = this.id;
    }

    if (image) {
      this.image = image;
    } else {
      this.image = new Image(width, height);
    }

    this.size = {
      x: this.image.width,
      y: this.image.height,
    };
  }
}

export type LayerUpdateCallback = (layer: Layer) => Layer;
