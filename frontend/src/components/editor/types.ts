import { Vector2d } from "konva/lib/types";

// Matches Konva's way of storing points: x coordinates on even indices, and y
// on odd indices.
type Point = Array<number>;

export type LayerId = string;

export interface Line {
  points: Array<Point>;
  color: string;
  width: number;
  tool: string | null;
}

export class Layer {
  name: string;
  id: LayerId; // UUID
  imageData: ImageData | null = null;
  image: HTMLImageElement;

  layerRef: any; // Ref to the Konva Layer underlying object
  visible: boolean = true;
  position: Vector2d = {
    x: 0,
    y: 0,
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
