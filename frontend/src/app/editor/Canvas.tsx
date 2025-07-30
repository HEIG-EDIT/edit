"use client";
import { useRef, useState, useCallback, createRef } from "react";
import { Stage, Line as KonvaLine, Layer as KonvaLayer } from "react-konva";
import { LayerComponent } from "./Layer";
import { LayerState, CanvasState } from "./types";
import { projectFromJSON, projectToJSON } from "./serialization";

const utils = require("./utils.ts");

interface CanvasProps {
  initialWidth: number;
  initialHeight: number;
}

export const Canvas = ({ initialWidth, initialHeight }: CanvasProps) => {
  const {
    state: layers,
    setState: setLayers,
    setVirtualState: setVirtualLayers,
    commitVirtualState: commitVirtualLayers,
    undo,
    redo,
    canUndo,
    canRedo,
  } = utils.useUndoRedo(Array<LayerState>());

  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const isDrawing = useRef(false);

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
    const JSONString = projectToJSON({
      layers: layers,
      width: width,
      height: height,
    });
    var blob = new Blob([JSONString], { type: "text/json;charset=utf-8" });

    var FileSaver = require("file-saver");

    FileSaver.saveAs(blob, "project.json");
  };

  const handleProjectUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const project = projectFromJSON(reader.result as string);

      setWidth(project.width);
      setHeight(project.height);
      setLayers(
        project.layers.map((layer) => {
          return createLayer(layer.image, layer.x, layer.y, layer.id);
        }),
      );
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

    setVirtualLayers((prev: Array<LayerState>) => {
      return prev.map((layer: LayerState) => {
        return {
          ...layer,
          lines: layer.lines.concat([
            {
              // Subtract layer position to account for offset
              points: [pos.x - layer.x, pos.y - layer.y],
              color: "#FF00FFFF",
              width: 3,
              tool: null,
            },
          ]),
        };
      });
    });
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }

    const point = e.target.getStage().getPointerPosition();

    setVirtualLayers((prev: Array<LayerState>) => {
      return prev.map((layer: LayerState) => {
        let lines = layer.lines.slice();
        const currentLine = lines[lines.length - 1];
        currentLine.points = currentLine.points.concat([
          point.x - layer.x,
          point.y - layer.y,
        ]);

        layer.lines = lines;
        return layer;
      });
    });
  };

  const handleMouseUp = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      commitVirtualLayers();
    }
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
