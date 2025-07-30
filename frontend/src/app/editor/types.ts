type Point = Array<number>;

export interface Line {
  points: Array<Point>;
  color: string;
  width: number;
  tool: string | null;
}

// The state of the layers is held by the parent "Cavnas" component. This enables
// the dynamic creation of layers.
export interface LayerState {
  image: HTMLImageElement;
  imageData: ImageData;
  layerRef: any;
  id: string;
  x: number;
  y: number;
  lines: Array<Line>;
}

export interface CanvasState {
  width: number;
  height: number;
  layers: Array<LayerState>;
}
