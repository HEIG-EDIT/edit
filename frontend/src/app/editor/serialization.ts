import { LayerState, CanvasState } from "./types";
import { imageToImageData } from "./utils";

interface SerializedLayer {
  imageURL: string;
  id: string;
  x: number;
  y: number;
}

const loadImage = (url: string) => {
  const promise = new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      resolve(img);
    };
  });
  return promise.then();
};

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

export const projectFromJSON = (JSONString: string): Promise<CanvasState> => {
  const input = JSON.parse(JSONString);

  return new Promise<CanvasState>((resolve) => {
    let result = {
      width: input.width,
      height: input.height,
      layers: input.layers.map((layer: SerializedLayer) => {
        const image = new Image();
        image.onload = () => {};
      }),
    };

    resolve(result);
  });
  const layerPromises = input.layers.map((layer: SerializedLayer) => {
    return new Promise<Partial<LayerState>>((resolve) => {
      const image = new Image();
      image.src = layer.imageURL;
      image.onload = () => {
        const layerState: Partial<LayerState> = {
          image: image,
          x: layer.x,
          y: layer.y,
          id: layer.id,
        };
        resolve(layerState);
      };
    });
  });
  let projectLayers: null | Array<LayerState> = null;
  Promise.all(layerPromises).then((layers) => {
    layers = layers;
  });
  assert(projectLayers !== null);
  return {
    width: input.width,
    height: input.height,
    layers: projectLayers,
  };

  return {
    layers: input.layers.map((layer: SerializedLayer) => {
      const image = loadImage(layer.imageURL);
      return {
        id: layer.id,
        image: image,
        x: layer.x,
        y: layer.y,
      };
    }),
  };
};
