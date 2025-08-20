// use https://konvajs.org/docs/select_and_transform/Basic_demo.html

"use client";

import React, { useRef, useState, useCallback, useContext, createContext } from "react";
import { Stage, Layer as KonvaLayer, Rect } from "react-konva";
import { KonvaMouseEvent, KonvaScrollEvent } from "@/models/editor/utils/events";
import {
  Layer,
  LayerId,
  LayerUpdateCallback,
} from "@/models/editor/layers/layer";
import { LayerComponent } from "./layers/layer";
import { Vector2d } from "konva/lib/types";
import { MOVE_TOOL } from "@/components/editor/tools/move";
import { TransformDiff } from "@/models/editor/layers/layerProps";
import { v2Add, v2Sub } from "@/models/editor/layers/layerUtils";
import { useEditorContext } from "@/components/editor/editorContext";

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
  setLayers: setLayers,
  setVirtualLayers,
  commitVirtualLayers,
  updateLayer,
  nameSelectedTool,
  width,
  height,
}: CanvasProps) => {
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

  const isTransforming = useRef(false);

  const { editSelectedLayers, getCanvasPointerPosition, handleLayerSelection, canvasState, setCanvasState, stageRef } = useEditorContext();

  const isDrawing = useRef(false);
  const handleDrawStart = (e: KonvaMouseEvent) => {
    isDrawing.current = true;

    editSelectedLayers(layer => {
      const pointPosition = v2Sub(getCanvasPointerPosition(), layer.position);
      return {
        ...layer,
        lines: layer.lines.concat([
          {
            points: [pointPosition.x, pointPosition.y],
            color: ,
            width: 3,
            tool: null,
          }
        ])
      };
    }, true);
  };

  const handleMouseDown = (e: KonvaMouseEvent) => {
    e.evt.preventDefault();
    if (nameSelectedTool != MOVE_TOOL.name || isTransforming.current) {
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

      editSelectedLayers(layer => {
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
      }, true)
    }
  };

  // Determine whether or not the mouse is dragging across the canvas. The
  // mouse needs to move past a certain threshold before the action is
  // considered a drag and not a click.
  const getLayerDragPositionDiff = useCallback(() => {
    const canvasPosition = getCanvasPointerPosition();
    return v2Sub(canvasPosition, layerDragStartPosition);
  }, [canvasDragStartPosition, getCanvasPointerPosition]);

  const handleMouseMove = (e: KonvaMouseEvent) => {
    if (isTransforming.current) {
      return;
    }
    if (isHoldingPrimary.current) {
      const positionDiff = getLayerDragPositionDiff();

      // Not dragging
      // FIXME: Maybe update threshold?
      if (Math.hypot(positionDiff.x, positionDiff.y) < 2) {
        return;
      }

      isDraggingLayers.current = true;

      editSelectedLayers(layer => {
        return {
          ...layer,
          position: v2Add(layer.positionBeforeDrag, positionDiff),
        };
      }, true)

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
    if (isTransforming.current) {
      isTransforming.current = false;
      return;
    }

    isDraggingCanvas.current = false;
    isHoldingPrimary.current = false;

    if (e.evt.button != CANVAS_DRAG_MOUSE_BUTTON && !isDraggingLayers.current) {
      handleLayerSelection(e);
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

  const transformSelectedLayers = (diff: TransformDiff) => {
    editSelectedLayers(layer => {
      return {
        ...layer,
        scale: v2Add(layer.scale, diff.scale),
        position: v2Add(layer.position, diff.position),
        rotation: layer.rotation + diff.rotation,
      };
    })
  };

  // Context used to give child components manipulation capabilities on the whole
  // canvas
  const canvasContext = useContext(createContext({
    getCanvasPointerPosition: getCanvasPointerPosition,
    editSelectedLayers: editSelectedLayers,
  }));

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
                isVisible={layer.isVisible}
                isSelected={layer.isSelected}
                lines={layer.lines}
                ref={layer.groupRef}
                updateLayer={(
                  callback: LayerUpdateCallback,
                  virtual: boolean,
                ) => updateLayer(layer.id, callback, virtual)}
                setIsTransforming={(val: boolean) => {
                  isTransforming.current = val;
                }}
                transformSelectedLayers={transformSelectedLayers}
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
