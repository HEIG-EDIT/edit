"use client";
import { useRef, useState, useCallback, createRef } from "react";
import { Stage, Line as KonvaLine, Layer as KonvaLayer } from "react-konva";
import { LayerComponent } from "./Layer";
import { LayerControlsComponent } from "./LayerControls";
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

  const addLayer = (layer: LayerState) => {
    setLayers((prev: LayerState[]) => {
      return [...prev, layer];
    });
  };

  const importLayer = useCallback((layer: Partial<LayerState>) => {
    const result = {
      ...layer,
      layerRef: createRef(),
      imageData: utils.imageToImageData(layer.image),
    };
    return result;
  }, []);

  const createLayer = useCallback(
    (image: HTMLImageElement, name: string) => {
      const layer: LayerState = {
        id: getUUID(),
        visible: true,
        name: name,
        image: image,
        imageData: utils.imageToImageData(image),
        layerRef: createRef(),
        x: 0,
        y: 0,
        lines: [],
      };
      addLayer(layer);
    },
    [addLayer],
  );

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;

      img.onload = () => {
        createLayer(img, file.name);
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

  const handleProjectUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      const project = await projectFromJSON(reader.result as string);

      setWidth(project.width);
      setHeight(project.height);
      const layers = project.layers.map((layer) => {
        console.log(layer);
        return importLayer(layer);
      });
      console.log(layers);
      setLayers(layers);
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

  const handleVisibilityToggle = (layerId: string) => {
    return () => {
      const [i, layerState] = findLayer(layerId);
      changeLayer(i, (_) => {
        return {
          ...layerState,
          visible: !layerState.visible,
        };
      });
    };
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
      <div className="bg-red-200">
        {layers.map(({ name, visible, id }: Partial<LayerState>) => {
          console.log("Mapping layer controls");
          return (
            <LayerControlsComponent
              key={id}
              name={name}
              visible={visible}
              toggleVisible={handleVisibilityToggle(id)}
            />
          );
        })}
      </div>
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
          {layers?.map(
            ({
              image,
              id,
              x,
              y,
              layerRef,
              lines,
              visible,
            }: Partial<LayerState>) => (
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
                visible={visible}
              />
            ),
          )}
        </Stage>
      </div>
    </div>
  );
};

export default function ImageEditor() {
  return (
    <div>
      <Canvas initialWidth={800} initialHeight={200} />
    </div>
  );
}
