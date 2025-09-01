import { Layer, SerializedLayer } from "@/models/editor/layers/layer";
import { Vector2d } from "konva/lib/types";

/// Class holding the logic for serialization / deserialization of EDIT projects.
export class Project {
  /// A list of layers in the projetc
  layers: Layer[];
  /// The size of the project's canvas
  canvasSize: Vector2d;

  /// Create a new project from the editor's current state
  /// @param layers The layers currently in the canvas
  /// @param canvasSize The size of the editor's current canvas
  constructor(layers: Layer[], canvasSize: Vector2d) {
    this.layers = layers;
    this.canvasSize = canvasSize;
  }

  /// Convert the Project to a JSON string
  /// @returns A JSON string containing the serialized project. This includes
  ///          the layers' images encoded as base64.
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

  /// Convert a serialized JSON proEct string to a Project object
  /// @param JSONProject the serialized project's JSON string
  /// @returns The resulting Project that can be loaded in the editor
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
