"use client";
import { useRef, useState, useCallback, createRef } from "react";
import { Stage } from "react-konva";
import { LayerComponent } from "./Layer";

const imageToImageData = (image: HTMLImageElement): ImageData => {
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = image.width;
  tmpCanvas.height = image.height;

  const ctx = tmpCanvas.getContext("2d");
  ctx?.drawImage(image, 0, 0);
  const result = ctx?.getImageData(0, 0, image.width, image.height);

  if (result) {
    return result;
  }

  throw Error("Could not extract imageData from the input image.");
};

const imageDataToImage = (imageData: ImageData): HTMLImageElement => {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx?.putImageData(imageData, 0, 0);

  var image = new Image();
  image.src = canvas.toDataURL();
  return image;
};

interface CanvasProps {
  initialWidth: number;
  initialHeight: number;
}

interface LayerState {
  image: HTMLImageElement;
  imageData: ImageData;
  layerRef: any;
  id: string;
  x: number;
  y: number;
}

function useUndoRedo<T>(initialState: T) {
  const [states, setStates] = useState([initialState]);
  const [index, setIndex] = useState(0);

  const setState = useCallback(
    (newState: T | ((prev: T) => T)) => {
      const func = typeof newState === "function" ? newState : () => newState;

      setStates((currentStates) => {
        const newStates = currentStates.slice(0, index + 1);
        return [...newStates, func(currentStates[index])];
      });
      setIndex((currentIndex) => currentIndex + 1);
    },
    [index],
  );

  const undo = useCallback(() => {
    setIndex((currentIndex) => Math.max(0, currentIndex - 1));
  }, []);

  const redo = useCallback(() => {
    setIndex((currentIndex) => Math.min(states.length - 1, currentIndex + 1));
  }, [states.length]);

  const canUndo = index > 0;
  const canRedo = index < states.length - 1;

  return {
    state: states[index],
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

export const Canvas = ({ initialWidth, initialHeight }: CanvasProps) => {
  const {
    state: layers,
    setState: setLayers,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo(Array<LayerState>());
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);

  const stageRef = useRef(null);

  const getUUID = useCallback((): string => {
    return crypto.randomUUID();
  }, []);

  // Get a layer's array index and state from it's id
  const findLayer = useCallback(
    (layerId: string): [number, LayerState] => {
      for (const [i, layer] of layers.entries()) {
        if (layer.id === layerId) {
          return [i, layer];
        }
      }

      throw Error(`Could not find layer with id ${layerId}`);
    },
    [layers],
  );

  const editLayer = (layerId: string) => {
    const [i, layer] = findLayer(layerId);

    const width = layer.imageData.width;
    const height = layer.imageData.height;

    const newPixels = layer.imageData.data.slice();
    for (let i = 0; i < width * height * 4; i += 12) {
      newPixels[i] = 255;
      newPixels[i + 1] = 0;
      newPixels[i + 2] = 255;
    }

    const newImageData = new ImageData(newPixels, width, height);
    changeLayer(i, () => {
      return {
        ...layer,
        imageData: newImageData,
        image: imageDataToImage(newImageData),
      };
    });
  };

  const changeLayer = (
    i: number,
    callback: (layerState: LayerState) => LayerState,
  ) => {
    const layer = layers[i];
    const newLayer = callback(layer);

    setLayers((prev) => [...prev.slice(0, i), newLayer, ...prev.slice(i + 1)]);
  };

  const handleDragEnd = (e) => {
    const id = e.target.id();
    const [i, _] = findLayer(id);

    changeLayer(i, (layer) => {
      let newLayer: LayerState = {
        ...layer,
        x: e.target.x(),
        y: e.target.y(),
      };
      return newLayer;
    });
  };

  const draw = () => {
    // editLayer(0)
  };

  const createLayer = useCallback(
    (
      image: HTMLImageElement,
      x: number = 0,
      y: number = 0,
      id: string | null = null,
    ) => {
      id = id == null ? getUUID() : id;
      const layer: LayerState = {
        id: id,
        image: image,
        imageData: imageToImageData(image),
        layerRef: createRef(),
        x: x,
        y: y,
      };

      return layer;
    },
    [],
  );

  const addLayer = (layer: LayerState) => {
    setLayers((prev: LayerState[]) => [...prev, layer]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;

      img.onload = () => {
        const layer = createLayer(img);
        addLayer(layer);
      };
    };

    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!stageRef.current) {
      return;
    }
    const json = stageRef.current.toObject();
    json.images = {};

    for (const layer of layers) {
      console.log(layer);
      if (!layer.layerRef.current) {
        console.log("Missing layerRef");
        continue;
      }
      const b64String = layer.layerRef.current.toDataURL({
        mimeType: "image/jpeg",
        quality: 1,
      });

      json.images[layer.id] = b64String;
    }

    const JSONString = JSON.stringify(json);
    var blob = new Blob([JSONString], { type: "text/json;charset=utf-8" });

    var FileSaver = require("file-saver");

    FileSaver.saveAs(blob, "project.json");
  };

  const handleProjectUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const project = JSON.parse(reader.result as string);

      setWidth(project.attrs.width);
      setHeight(project.attrs.height);

      const loadPromises = project.children.map((layer: object) => {
        return new Promise<LayerState>((resolve) => {
          const image = new Image();
          image.src = layer.src;
          console.log(image);
          image.onload = () => {
            const layerState = createLayer(
              image,
              layer.attrs.x,
              layer.attrs.y,
              layer.attrs.id,
            );
            resolve(layerState);
          };
        });
      });

      Promise.all(loadPromises).then((loadedLayers) => {
        setLayers(loadedLayers);
        console.log("All layers loaded:", loadedLayers);
      });
    };

    reader.readAsText(file);
  };

  const handleRefresh = (e) => {
    console.log(layers);
  };

  return (
    <div>
      <input
        name="Import project"
        type="file"
        accept="text/json"
        onChange={handleProjectUpload}
      />
      <input
        name="Add layer"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
      />
      <button onClick={draw}>Rosification</button>
      <button disabled={!canUndo} onClick={undo}>
        Undo
      </button>
      <button disabled={!canRedo} onClick={redo}>
        Redo
      </button>
      <button onClick={handleSave}>Save</button>
      <div className="border-2 " id="stage-div">
        <Stage
          ref={stageRef}
          className="border-1"
          width={width}
          height={height}
        >
          {layers?.map(({ image, id, x, y, layerRef }) => (
            <LayerComponent
              key={id}
              id={id}
              image={image}
              onDragEnd={handleDragEnd}
              x={x}
              y={y}
              ref={layerRef}
            />
          ))}
        </Stage>
      </div>
    </div>
  );
};

export default function ImageEditor() {
  return (
    <div>
      <Canvas initialWidth={800} initialHeight={800} />
    </div>
  );
}
