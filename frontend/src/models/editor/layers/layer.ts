import { Vector2d } from "konva/lib/types";
import { createRef } from "react";
import { Line } from "./line";

export type LayerId = string;

export class Layer {
  name: string;
  id: LayerId; // UUID
  imageData: ImageData | null = null;
  image: HTMLImageElement;
  isSelected: boolean = false;

  // Refs to the underlying Konva components
  groupRef: any;
  // FIXME: Check if useful
  imageRef: any;

  isVisible: boolean = true;
  position: Vector2d = {
    x: 0,
    y: 0,
  };
  scale: Vector2d = {
    x: 1,
    y: 1,
  };
  rotation: number = 0;
  lines: Array<Line> = []; // Lines drawn free-hand on a Layer

  constructor(
    name: string | null = null,
    image: HTMLImageElement | null = null,
    width: number = 0,
    height: number = 0,
  ) {
    this.id = crypto.randomUUID();
    this.groupRef = createRef();
    this.imageRef = createRef();

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
  }
}

export type LayerUpdateCallback = (layer: Layer) => Layer;
