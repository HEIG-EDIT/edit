import { Layer, SerializedLayer } from "@/models/editor/layers/layer";
import { Vector2d } from "konva/lib/types";

export class Project {
  layers: Layer[];
  canvasSize: Vector2d;

  constructor(layers: Layer[], canvasSize: Vector2d) {
    this.layers = layers;
    this.canvasSize = canvasSize;
  }

  toJSON(): string {
    const result = {
      canvasSize: this.canvasSize,
      layers: this.layers.map((layer) => {
        return {
          id: layer.id,
          name: layer.name,
          isVisible: layer.isVisible,
          isSelected: layer.isSelected,
          imageURL: layer.groupRef.current?.toDataURL({
            mimeType: "image/png",
            quality: 1,
          }),
          position: layer.position,
          scale: layer.scale,
          rotation: layer.rotation,
          size: layer.size,
        };
      }),
    };

    return JSON.stringify(result);
  }

  static async fromJSON(JSONProject: string): Promise<Project> {
    const input = JSON.parse(JSONProject);

    const loadPromises = input.layers.map(
      (serializedLayer: SerializedLayer) => {
        return new Promise<Layer>((resolve) => {
          resolve(Layer.fromSerialized(serializedLayer));
        });
      },
    );
    return Promise.all(loadPromises).then((loadedLayers) => {
      return new Project(loadedLayers, input.canvasSize);
    });
  }
}
