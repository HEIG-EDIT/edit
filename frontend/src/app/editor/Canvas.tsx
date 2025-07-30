"use client";
import { useRef, useState, useCallback, createRef } from "react";
import { Stage, Line as KonvaLine, Layer as KonvaLayer } from "react-konva";
import { LayerComponent } from "./Layer";
import { Line } from "./types";

const utils = require("./utils.ts");

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
  lines: Array<Line>;
}

const CanvasLine = ({ line }) => {
  if (line) {
    console.log("Has line");
    console.log(line);
    return (
      <KonvaLayer>
        <KonvaLine
          key={"line"}
          points={line.points}
          stroke={line.color}
          strokeWidth={line.width}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
          globalCompositeOperation={"source-over"}
        />
      </KonvaLayer>
    );
  }
};

export const Canvas = ({ initialWidth, initialHeight }: CanvasProps) => {
  const {
    state: layers,
    setState: setLayers,
    undo,
    redo,
    canUndo,
    canRedo,
  } = utils.useUndoRedo(Array<LayerState>());

  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const isDrawing = useRef(false);
  const [line, setLine] = useState();

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
        image: utils.imageDataToImage(newImageData),
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
        imageData: utils.imageToImageData(image),
        layerRef: createRef(),
        x: x,
        y: y,
        lines: [],
      };

      return layer;
    },
    [],
  );

  const addLayer = (layer: LayerState) => {
    setLayers((prev: LayerState[]) => {
      return [...prev, layer];
    });
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
        console.log("Loaded project");
      });
    };

    reader.readAsText(file);
  };

  const handleDrawMode = (e) => {
    setIsDrawingMode((prev) => !prev);
  };

  const handleMouseDown = (e) => {
    if (!isDrawingMode) {
      return;
    }

    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();

    setLine({ points: [pos.x, pos.y], color: "#FF00FF", width: 3, tool: null });

    setLayers((prev: Array<LayerState>) => {
      return prev.map((layer: LayerState) => {
        const newLayer = {
          ...layer,
          lines: layer.lines.concat([
            {
              points: [pos.x, pos.y],
              color: "#FF00FFFF",
              width: 3,
              tool: null,
            },
          ]),
        };
        return newLayer;
      });
    });
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }

    const stage = stageRef.current;
    if (stage == null) {
      return;
    }

    const point = stage.getPointerPosition();

    setLayers((prev: Array<LayerState>) => {
      const result = prev.map((layer: LayerState) => {
        const newLayer = { ...layer };

        const currentLine = layer.lines[layer.lines.length - 1];
        currentLine.points = currentLine.points.concat([point.x, point.y]);
        const newLine = layer.lines;
        newLine.splice(layer.lines.length - 1, 1, currentLine);
        newLayer.lines = newLine;
        return newLayer;
      });
      console.log(`Result:`, result);
      return result;
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
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
      <label>
        Draw: <input onChange={handleDrawMode} type="checkbox" />
      </label>
      <div className="border-2 " id="stage-div">
        <Stage
          ref={stageRef}
          className="border-1"
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {layers?.map(({ image, id, x, y, layerRef, lines }) => (
            <LayerComponent
              key={id}
              id={id}
              image={image}
              onDragEnd={handleDragEnd}
              draggable={!isDrawingMode}
              lines={lines}
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
