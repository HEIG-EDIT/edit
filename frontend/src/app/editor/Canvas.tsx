"use client";
import { useRef, useState, useCallback, createRef } from "react";
import { Stage as StageComponent, Line as KonvaLine, Layer as KonvaLayer } from "react-konva";
import KonvaEventObject from "konva";
import Stage from "konva";
import { LayerComponent } from "./Layer";
import { LayerControlsComponent } from "./LayerControls";
import { LayerState, CanvasState } from "./types";
import { projectFromJSON, projectToJSON } from "./serialization";
import { log } from "console";
import { Vector2d } from "konva/lib/types";

const utils = require("./utils.ts");

type Event<T> = React.ChangeEvent<T>;
type KonvaMouseEvent = KonvaEventObject.KonvaEventObject<MouseEvent>;

interface CanvasProps {
  initialWidth: number;
  initialHeight: number;
}

interface StageState {
  scale: number;
  offset: Vector2d;
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

  const [stageState, setStageState] = useState({
    scale: 1,
    offset: { x: 0, y: 0 },
  });

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const isDrawing = useRef(false);

  const [isMoveMode, setIsMoveMode] = useState(false);
  const isMovingCanvas = useRef(false);

  const stageRef = useRef<Stage.Stage>(null);
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

  const handleMouseMiddleDown = (e: KonvaMouseEvent) => {
    if (!isMoveMode) {
      return;
    }

    isMovingCanvas.current = true;
  }


  const getPointerPosition = useCallback(() => {
    const stagePosition = stageRef?.current?.getPointerPosition();
    if (!stagePosition) {
      throw new Error("Could not get the stage pointer position");
    }

    const { scale, offset } = stageState;
    return {
      x: (stagePosition.x - offset.x) / scale,
      y: (stagePosition.y - offset.y) / scale,
    };
  },
    [stageState]);


  const handleMouseDown = (e: KonvaMouseEvent) => {
    // Scroll click (The number is different from regular HTML events)
    if (e.evt.button == 1) {
      return handleMouseMiddleDown(e);
    }

    if (!isDrawingMode) {
      return;
    }

    const pos = getPointerPosition();
    isDrawing.current = true;

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

  const handleMiddleMouseMove = (e: KonvaMouseEvent) => { };

  const handleMouseMove = (e: KonvaMouseEvent) => {
    if (isMovingCanvas.current) {
      console.log("Is movin");
      return handleMiddleMouseMove(e);
    }

    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }

    console.log("Regular button move");

    const point = getPointerPosition();

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
    if (isMovingCanvas.current) {
      isMovingCanvas.current = false;
    }
  };

  const handleMouseUp = (e: KonvaMouseEvent) => {
    if (isMovingCanvas.current) {
      return handleMiddleMouseUp(e);
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

    const pointer = stageRef?.current?.getPointerPosition();
    if (!pointer) {
      return;
    }

    const pos = getPointerPosition();
    // In or out
    let direction = e.evt.deltaY > 0 ? 1 : -1;

    if (e.evt.ctrlKey) {
      direction = -direction;
    }

    const scaleBy = 1.10;

    setStageState(({ scale, offset }) => {
      const newScale = direction > 0 ? scale * scaleBy : scale / scaleBy;
      return {
        scale: newScale,
        offset: {
          x: pointer.x - pos.x * scale, y: pointer.y - pos.y * scale
        }
      };
    })
  }

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
        <div className="inline-block border-2 " id="stage-div">
          <StageComponent
            draw
            ref={stageRef}
            className="border-1"
            width={width}
            height={height}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onWheel={handleScroll}
            scale={{ x: stageState.scale, y: stageState.scale }}
            offset={stageState.offset}
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
                  draggable={isMoveMode}
                  lines={lines}
                  x={x}
                  y={y}
                  ref={layerRef}
                  visible={visible}
                />
              ),
            )}
          </StageComponent>
        </div>
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
