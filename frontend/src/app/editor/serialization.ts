import { LayerState, CanvasState } from "./types";
import { imageToImageData } from "./utils";

interface SerializedLayer {
  imageURL: string;
  id: string;
  x: number;
  y: number;
}

export const projectToJSON = (project: CanvasState): string => {
  let result = {
    width: project.width,
    height: project.height,
    layers: project.layers.map((layerState: LayerState) => {
      return {
        id: layerState.id,
        imageURL: layerState.layerRef.current.toDataURL({
          mimeType: "image/jpeg",
          quality: 1,
        }),
        x: layerState.x,
        y: layerState.y,
      };
    }),
  };

  return JSON.stringify(result);
};

export const projectFromJSON = async (
  JSONString: string,
): Promise<CanvasState> => {
  const input = JSON.parse(JSONString);

  const loadPromises = input.layers.map((layer: SerializedLayer) => {
    return new Promise<Partial<LayerState>>((resolve) => {
      const image = new Image();
      image.src = layer.imageURL;
      image.onload = () => {
        const layerState: Partial<LayerState> = {
          x: layer.x,
          y: layer.y,
          id: layer.id,
          image: image,
        };
        resolve(layerState);
      };
    });
  });

  return Promise.all(loadPromises).then((loadedLayers) => {
    return {
      width: input.width,
      height: input.height,
      layers: loadedLayers,
    };
  });
};
