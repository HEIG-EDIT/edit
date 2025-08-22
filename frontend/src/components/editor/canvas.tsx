// use https://konvajs.org/docs/select_and_transform/Basic_demo.html

"use client";

import React, { useRef, useState } from "react";
import { Stage, Layer as KonvaLayer, Rect } from "react-konva";
import {
  CANVAS_DRAG_MOUSE_BUTTON,
  KonvaMouseEvent,
  KonvaScrollEvent,
  MOUSE_DOWN,
  MOUSE_MOVE,
  MOUSE_UP,
  PRIMARY_MOUSE_BUTTON,
} from "@/models/editor/utils/events";
import {
  Layer,
  LayerId,
  LayerUpdateCallback,
} from "@/models/editor/layers/layer";
import { LayerComponent } from "./layers/layer";
import { Vector2d } from "konva/lib/types";
import {
  CanvasState,
  useEditorContext,
} from "@/components/editor/editorContext";

type CanvasProps = {
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  updateLayer: (
    id: LayerId,
    callback: LayerUpdateCallback,
    virtual?: boolean,
  ) => void;
  setVirtualLayers: (layer: Layer[] | ((layer: Layer[]) => Layer[])) => void;
  commitVirtualLayers: () => void;
  nameSelectedTool: string;
  height: number;
  width: number;
};

export const Canvas = ({
  layers: layers,
  updateLayer,
  width,
  height,
}: CanvasProps) => {
  const isDraggingCanvas = useRef(false);
  const [canvasDragStartPosition, setCanvasDragStartPosition] =
    useState<Vector2d>({
      x: 0,
      y: 0,
    });

  const {
    getCanvasPointerPosition,
    canvasState,
    setCanvasState,
    stageRef,
    toolEventHandlers,
    isHoldingPrimary,
  } = useEditorContext();

  const handleMouseDown = (e: KonvaMouseEvent) => {
    e.evt.preventDefault();

    if (e.evt.button == CANVAS_DRAG_MOUSE_BUTTON) {
      setCanvasDragStartPosition({
        x: e.evt.clientX - canvasState.position.x,
        y: e.evt.clientY - canvasState.position.y,
      });

      isDraggingCanvas.current = true;
    } else if (e.evt.button == PRIMARY_MOUSE_BUTTON) {
      const handler = toolEventHandlers.current[MOUSE_DOWN];
      if (handler) {
        handler(e);
      }
    }
  };

  const handleMouseMove = (e: KonvaMouseEvent) => {
    if (!isDraggingCanvas.current) {
      const handler = toolEventHandlers.current[MOUSE_MOVE];
      if (handler) {
        return handler(e);
      }
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

    if (e.evt.button == PRIMARY_MOUSE_BUTTON) {
      const handler = toolEventHandlers.current[MOUSE_UP];
      if (handler) {
        handler(e);
        return;
      }
    }
  };

  const handleScroll = (e: KonvaScrollEvent) => {
    e.evt.preventDefault();

    // Arbitrary
    const MINIMUM_SCALE = 0.02;

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

      if (newScale < MINIMUM_SCALE) {
        return prev;
      }

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
                size={layer.size}
                isVisible={layer.isVisible}
                isSelected={layer.isSelected}
                lines={layer.lines}
                ref={layer.groupRef}
                updateLayer={(
                  callback: LayerUpdateCallback,
                  virtual: boolean,
                ) => updateLayer(layer.id, callback, virtual)}
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
