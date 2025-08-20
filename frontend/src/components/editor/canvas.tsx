// use https://konvajs.org/docs/select_and_transform/Basic_demo.html

"use client";

import React, { useRef, useState } from "react";
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

// Middle click
const CANVAS_DRAG_MOUSE_BUTTON = 1;

export const Canvas = ({
  layers: layers,
  setLayers: setLayers,
  updateLayer,
  nameSelectedTool,
  width,
  height,
}: CanvasProps) => {
  // TODO : to remove, usefull to pass deployment with eslint check ("'nameSelectedTool' is defined but never used.  @typescript-eslint/no-unused-vars")
  console.log(nameSelectedTool);

  const stageRef = useRef<Konva.Stage>(null);
  const canvasRef = useRef<Konva.Layer>(null);

  const isDraggingCanvas = useRef(false);
  const [dragStartPosition, setDragStartPosition] = useState<Vector2d>({
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

  // TODO : to remove, usefull to pass deployment with eslint check ("'setCanvasState' is assigned a value but never used.  @typescript-eslint/no-unused-vars")
  console.log(setCanvasState);

  const getCanvasPointerPosition = () => {
    const stagePosition = stageRef?.current?.getPointerPosition();
    if (!stagePosition) {
      // Should not happen
      throw new Error("Could not get the stage pointer position");
    }

    const state = canvasState;

    return {
      x: (stagePosition.x - state.position.x) / state.scale,
      y: (stagePosition.y - state.position.y) / state.scale,
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

    if (e.evt.button != CANVAS_DRAG_MOUSE_BUTTON) {
      handleLayerSelection();
    }

    isDraggingCanvas.current = true;
    setDragStartPosition({
      x: e.evt.clientX - canvasState.position.x,
      y: e.evt.clientY - canvasState.position.y,
    });
  };

  const handleMouseMove = (e: KonvaMouseEvent) => {
    if (!isDraggingCanvas.current) {
      // TODO: Handle other cases
      return;
    }
    if (e.evt.buttons != 4) {
      isDraggingCanvas.current = false;
    }
    const newPos = {
      x: e.evt.clientX - dragStartPosition.x,
      y: e.evt.clientY - dragStartPosition.y,
    };

    setCanvasState((prev: CanvasState) => {
      return {
        ...prev,
        position: newPos,
      };
    });
  };

  const handleMouseUp = () => {
    isDraggingCanvas.current = false;
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
            console.log("Layer: ", layer);
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
