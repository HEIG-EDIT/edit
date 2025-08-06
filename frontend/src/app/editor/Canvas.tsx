"use client";
// TODO: Make aliases uniforms / cleanup
import { useRef, useState, useCallback, createRef } from "react";
import {
  Stage as StageComponent,
  Group as GroupComponent,
  Line as KonvaLine,
  Layer as KonvaLayerComponent,
  Rect as KonvaRect,
} from "react-konva";

import KonvaEventObject from "konva";
import Stage from "konva";
import Layer from "konva";
import Group from "konva";
import { LayerComponent } from "./Layer";
import { LayerControlsComponent } from "./LayerControls";
import { LayerState, CanvasState } from "./types";
import { projectFromJSON, projectToJSON } from "./serialization";
import { Vector2d } from "konva/lib/types";

const utils = require("./utils.ts");

// Left
const TOOL_APPLY_BUTTON = 0;
// Right
const CANVAS_DRAG_BUTTON = 1;

type Event<T> = React.ChangeEvent<T>;
type KonvaMouseEvent = KonvaEventObject.KonvaEventObject<MouseEvent>;

interface CanvasProps {
  initialWidth: number;
  initialHeight: number;
}

interface CanvasState {
  scale: number;
  position: Vector2d;
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

  const [canvasState, setCanvasState] = useState<CanvasState>({
    scale: 1,
    position: { x: 0, y: 0 },
  });

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const isDrawing = useRef(false);

  const [isMoveMode, setIsMoveMode] = useState(false);
  const isMovingCanvas = useRef(false);
  const isMovingLayer = useRef(false);

  const stageRef = useRef<Stage.Stage>(null);
  const canvasRef = useRef<Layer.Layer>(null);

  const projectInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const handleCanvasDragEnd = (e: KonvaMouseEvent) => {
    if (e.evt.button !== CANVAS_DRAG_BUTTON) {
      return;
    }

    console.log("Pointer position", getCanvasPointerPosition());
    console.log("Target position", {
      x: e.target.x(),
      y: e.target.y(),
    });

    setCanvasState((prev) => {
      return {
        ...prev,
        position: {
          x: e.target.x(),
          y: e.target.y(),
        },
      };
    });
    isMovingCanvas.current = false;
  };

  const handleLayerDragEnd = (e: KonvaMouseEvent) => {
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

  const handleProjectUpload = (e: Event<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      const project = await projectFromJSON(reader.result as string);

      setWidth(project.width);
      setHeight(project.height);
      const layers = project.layers.map((layer) => {
        return importLayer(layer);
      });
      setLayers(layers);
    };

    reader.readAsText(file);
  };

  const handleMoveMode = () => {
    setIsMoveMode((prev) => !prev);
  };

  const handleDrawMode = () => {
    setIsDrawingMode((prev) => !prev);
  };

  const getCanvasPointerPosition = useCallback(() => {
    const stagePosition = stageRef?.current?.getPointerPosition();
    if (!stagePosition) {
      throw new Error("Could not get the stage pointer position");
    }

    const state = canvasState;
    console.log("Canvas state: ", canvasState);

    return {
      x: (stagePosition.x - state.position.x) / state.scale,
      y: (stagePosition.y - state.position.y) / state.scale,
    };
  }, [stageRef, canvasState]);

  const handleCanvasDragStart = (e: KonvaMouseEvent) => {
    if (!isMoveMode) {
      return;
    }

    isMovingCanvas.current = true;
  };

  const handleStageMouseUp = (e: KonvaMouseEvent) => {};

  const handleStageMouseDown = (e: KonvaMouseEvent) => {};

  const handleMouseDown = (e: KonvaMouseEvent) => {
    console.log("Button: ", e.evt.button);
    if (e.evt.button == CANVAS_DRAG_BUTTON) {
      return handleCanvasDragStart(e);
    } else if (e.evt.button != TOOL_APPLY_BUTTON) {
      return;
    }

    if (isMoveMode) {
      isMovingLayer.current = true;
    } else if (isDrawingMode) {
      console.log("is Drawing");
      const pos = getCanvasPointerPosition();
      console.log("Drawing position: ", pos);
      isDrawing.current = true;

      setVirtualLayers((prev: Array<LayerState>) => {
        return prev.map((layer: LayerState) => {
          return {
            ...layer,
            lines: layer.lines.concat([
              {
                // Subtract layer position to account for offset
                // TODO: Maybe account for layer scale as well
                points: [pos.x - layer.x, pos.y - layer.y],
                color: "#FF00FFFF",
                width: 3,
                tool: null,
              },
            ]),
          };
        });
      });
    }
  };

  const handleMiddleMouseMove = (e: KonvaMouseEvent) => {
    const point = getCanvasPointerPosition();
    setCanvasState((prev) => {
      return {
        ...prev,
        position: point,
      };
    });
  };

  const handleMouseMove = (e: KonvaMouseEvent) => {
    if (isMovingCanvas.current) {
      console.log("Is movin");
      return handleMiddleMouseMove(e);
    }

    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }

    const point = getCanvasPointerPosition();

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

  const handleMiddleMouseUp = (e: KonvaMouseEvent) => {
    isMovingCanvas.current = false;
  };

  const handleMouseUp = (e: KonvaMouseEvent) => {
    if (e.evt.button == 1) {
      return handleMiddleMouseUp(e);
    }

    if (isMovingLayer.current) {
      isMovingLayer.current = false;
    }

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

  const handleScroll = (e: any) => {
    e.evt.preventDefault();

    console.log("Scroll event:", e.evt);

    if (e.evt.buttons == 4) {
      return;
    }

    const pointer = getCanvasPointerPosition();
    if (!pointer) {
      return;
    }

    // In or out
    let direction = e.evt.deltaY > 0 ? 1 : -1;

    if (e.evt.ctrlKey) {
      direction = -direction;
    }

    const scaleBy = 1.1;

    setCanvasState(({ scale, position }) => {
      const newScale = direction > 0 ? scale * scaleBy : scale / scaleBy;
      console.log("New scale: ", newScale);
      return {
        scale: newScale,
        position: {
          x: (pointer.x - position.x) * scale,
          y: (pointer.y - position.y) * scale,
        },
      };
    });
  };

  return (
    <div className="m-2">
      <label htmlFor="project-upload-input">Choose a project to upload</label>
      <input
        name="Import project"
        id="project-upload-input"
        type="file"
        accept="application/json"
        onChange={handleProjectUpload}
        ref={projectInputRef}
        className="opacity-0 w-0"
      />
      <label htmlFor="image-upload-input">Import image as layer</label>
      <input
        name="Add layer"
        id="image-upload-input"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        ref={imageInputRef}
        className="opacity-0 w-0"
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
      <label>
        Move: <input onChange={handleMoveMode} type="checkbox" />
      </label>
      <div className="bg-red-200">
        {layers.map(({ name, visible, id }: Partial<LayerState>) => {
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
      <div id="canvas-div" className="bg-purple-200">
        <StageComponent
          // TODO: Find a way to use all space available
          width={1920}
          height={1000}
          ref={stageRef}
          draggable={false}
          onWheel={handleScroll}
          // onMouseDown={handleStageMouseDown}
          // onMouseUp={handleStageMouseUp}
        >
          {/* Using a layer as the canvas */}
          <KonvaLayerComponent
            ref={canvasRef}
            className="border-1"
            width={width}
            height={height}
            onMouseDown={handleMouseDown}
            onDragEnd={handleCanvasDragEnd}
            // onMouseMove={handleMouseMove}
            // FIXME: Moving the canvas around is inverted
            // draggable={isMovingCanvas.current}
            scale={{ x: canvasState.scale, y: canvasState.scale }}
            x={canvasState.position.x}
            y={canvasState.position.y}
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
                  onMouseDown={handleMouseDown}
                  onDragEnd={handleLayerDragEnd}
                  // draggable={isMovingLayer.current}
                  lines={lines}
                  x={x}
                  y={y}
                  ref={layerRef}
                  visible={visible}
                />
              ),
            )}
            {/* Canvas outline, TODO: Is it possible to use a dashed line? */}
            <KonvaRect
              draggable={false}
              height={height}
              width={width}
              stroke={"black"}
              strokeWidth={2}
              strokeEnabled={true /* TODO: Link with editor setting */}
            />
          </KonvaLayerComponent>
        </StageComponent>
      </div>
    </div>
  );
};

export default function ImageEditor() {
  return (
    <div>
      <Canvas initialWidth={1200} initialHeight={800} />
    </div>
  );
}
