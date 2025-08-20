// use https://konvajs.org/docs/select_and_transform/Basic_demo.html

"use client";

import React, { useRef, useState, useCallback } from "react";
import { Stage, Layer as KonvaLayer, Rect } from "react-konva";
import Konva from "konva";
import KonvaEventObject from "konva";
import {
  Layer,
  LayerId,
  LayerUpdateCallback,
} from "@/models/editor/layers/layer";
import { LayerComponent } from "./layers/layer";
import { Vector2d } from "konva/lib/types";
import { MOVE_TOOL } from "@/components/editor/tools/move";

type CanvasProps = {
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  updateLayer: (id: LayerId, callback: LayerUpdateCallback) => void;
  setVirtualLayers: (layer: Layer[] | ((layer: Layer[]) => Layer[])) => void;
  commitVirtualLayers: () => void;
  nameSelectedTool: string;
  height: number;
  width: number;
};

type CanvasState = {
  scale: number;
  position: Vector2d;
};

type KonvaMouseEvent = KonvaEventObject.KonvaEventObject<MouseEvent>;
type KonvaScrollEvent = KonvaEventObject.KonvaEventObject<WheelEvent>;

// Left click
const PRIMARY_MOUSE_BUTTON = 0;

// Middle click
const CANVAS_DRAG_MOUSE_BUTTON = 1;

export const Canvas = ({
  layers: layers,
  setLayers: setLayers,
  setVirtualLayers,
  commitVirtualLayers,
  updateLayer,
  nameSelectedTool,
  width,
  height,
}: CanvasProps) => {
  const stageRef = useRef<Konva.Stage>(null);
  const canvasRef = useRef<Konva.Layer>(null);

  const isDraggingCanvas = useRef(false);
  const [canvasDragStartPosition, setCanvasDragStartPosition] =
    useState<Vector2d>({
      x: 0,
      y: 0,
    });

  const isDraggingLayers = useRef(false);
  const isHoldingPrimary = useRef(false);
  const [layerDragStartPosition, setLayerDragStartPosition] =
    useState<Vector2d>({
      x: 0,
      y: 0,
    });

  const [canvasState, setCanvasState] = useState<CanvasState>({
    scale: 1,
    position: {
      x: 0,
      y: 0,
    },
  });

  const getCanvasPointerPosition = () => {
    const stagePosition = stageRef?.current?.getPointerPosition();
    if (!stagePosition) {
      // Should not happen
      throw new Error("Could not get the stage pointer position");
    }

    const canvas = canvasState;

    return {
      x: (stagePosition.x - canvas.position.x) / canvas.scale,
      y: (stagePosition.y - canvas.position.y) / canvas.scale,
    };
  };

  // Click handler for stage handling layer selection
  const handleLayerSelection = () => {
    // Start by de-selecting all layers
    setLayers((prev) => {
      return prev.map((layer) => {
        return {
          ...layer,
          isSelected: false,
        };
      });
    });

    const pointer = stageRef.current?.getPointerPosition();
    if (!pointer) {
      return;
    }

    const target = stageRef.current?.getIntersection(pointer);

    if (target) {
      const layerId = target.parent?.id();
      if (!layerId) {
        return;
      }
      updateLayer(layerId, (prev) => {
        return {
          ...prev,
          isSelected: true,
        };
      });
    }
  };

  const handleMouseDown = (e: KonvaMouseEvent) => {
    e.evt.preventDefault();
    if (nameSelectedTool != MOVE_TOOL.name) {
      // TODO: Other cases will need to be handled (e.g. tool application)
      return;
    }

    if (e.evt.button == CANVAS_DRAG_MOUSE_BUTTON) {
      setCanvasDragStartPosition({
        x: e.evt.clientX - canvasState.position.x,
        y: e.evt.clientY - canvasState.position.y,
      });

      isDraggingCanvas.current = true;
    } else if (e.evt.button == PRIMARY_MOUSE_BUTTON) {
      setLayerDragStartPosition(getCanvasPointerPosition());
      isHoldingPrimary.current = true;

      setLayers((prev) => {
        return prev.map((layer) => {
          if (!layer.isSelected) {
            return layer;
          }
          return {
            ...layer,
            positionBeforeDrag: {
              x: layer.position.x,
              y: layer.position.y,
            },
          };
        });
      });
    }
  };

  // Determine whether or not the mouse is dragging across the canvas. The
  // mouse needs to move past a certain threshold before the action is
  // considered a drag and not a click.
  const getLayerDragPositionDiff = useCallback(() => {
    const canvasPosition = getCanvasPointerPosition();
    return {
      x: canvasPosition.x - layerDragStartPosition.x,
      y: canvasPosition.y - layerDragStartPosition.y,
    };
  }, [canvasDragStartPosition, getCanvasPointerPosition]);

  const handleMouseMove = (e: KonvaMouseEvent) => {
    if (isHoldingPrimary.current) {
      const positionDiff = getLayerDragPositionDiff();

      // Not dragging
      // FIXME: Maybe update threshold?
      if (Math.hypot(positionDiff.x, positionDiff.y) < 2) {
        return;
      }

      isDraggingLayers.current = true;

      setVirtualLayers((prev: Layer[]) => {
        return prev.map((layer) => {
          if (!layer.isSelected) {
            return layer;
          }
          return {
            ...layer,
            position: {
              x: layer.positionBeforeDrag.x + positionDiff.x,
              y: layer.positionBeforeDrag.y + positionDiff.y,
            },
          };
        });
      });

      return;
    }

    if (!isDraggingCanvas.current && !isDraggingLayers.current) {
      // TODO: Handle other cases
      return;
    }

    if (e.evt.buttons != 4) {
      isDraggingCanvas.current = false;
    }

    const newPos = {
      x: e.evt.clientX - canvasDragStartPosition.x,
      y: e.evt.clientY - canvasDragStartPosition.y,
    };

    setCanvasState((prev: CanvasState) => {
      return {
        ...prev,
        position: newPos,
      };
    });
  };

  const handleMouseUp = (e: KonvaMouseEvent) => {
    isDraggingCanvas.current = false;
    isHoldingPrimary.current = false;

    if (e.evt.button != CANVAS_DRAG_MOUSE_BUTTON && !isDraggingLayers.current) {
      handleLayerSelection();
      return;
    }

    if (isDraggingLayers.current) {
      commitVirtualLayers();
      isDraggingLayers.current = false;
    }
  };

  const handleScroll = (e: KonvaScrollEvent) => {
    e.evt.preventDefault();

    // Avoid accidental scrolling when moving aroung
    if (e.evt.buttons == 4) {
      return;
    }

    // In or out
    const direction = e.evt.deltaY < 0 ? 1 : -1;
    const scaleFactor = 1.1;
    const scaleBy = direction > 0 ? scaleFactor : 1 / scaleFactor;

    setCanvasState((prev) => {
      const stagePointerPosition = stageRef.current?.getPointerPosition();
      if (!stagePointerPosition) {
        return prev;
      }

      const { scale } = prev;

      const canvasPointerPosition = getCanvasPointerPosition();

      const newScale = scale * scaleBy;

      const newPos = {
        x: stagePointerPosition.x - canvasPointerPosition.x * newScale,
        y: stagePointerPosition.y - canvasPointerPosition.y * newScale,
      };

      return {
        scale: newScale,
        position: newPos,
      };
    });
  };

  return (
    <div>
      <Stage
        className="bg-violet-200"
        // TODO : voir avec code d'Alessio si taille respectée et plus modifier la taille du canvas
        // FIXME: Find a way to use all available space
        height={1000}
        width={1000}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleScroll}
        ref={stageRef}
        listening
      >
        {/* Unique Konva Layer of the stage representing the Canvas.
          EDIT Layers are "mapped" to Konva Groups */}
        <KonvaLayer
          listening
          ref={canvasRef}
          imageSmoothingEnabled={false}
          width={width}
          height={height}
          scale={{
            x: canvasState.scale,
            y: canvasState.scale,
          }}
          x={canvasState.position.x}
          y={canvasState.position.y}
        >
          {layers.map((layer) => {
            return (
              <LayerComponent
                id={layer.id}
                key={layer.id}
                position={layer.position}
                rotation={layer.rotation}
                scale={layer.scale}
                image={layer.image}
                isVisible={layer.isVisible}
                isSelected={layer.isSelected}
                lines={layer.lines}
                ref={layer.groupRef}
              />
            );
          })}
        </KonvaLayer>

        <KonvaLayer listening={false}>
          {/* Canvas outline, drawn as a Konva element */}
          <Rect
            listenting={false}
            draggable={false}
            height={height}
            width={width}
            stroke={"#7c3aed"}
            strokeWidth={2}
            strokeEnabled={true /* TODO: Link with editor setting */}
            scale={{
              x: canvasState.scale,
              y: canvasState.scale,
            }}
            x={canvasState.position.x}
            y={canvasState.position.y}
          />
        </KonvaLayer>
      </Stage>
    </div>
  );
};

export default Canvas;
