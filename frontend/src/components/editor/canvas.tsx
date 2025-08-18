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

  // Click handler for stage, allows selecting layers
  const handleStageClick = (e: KonvaMouseEvent) => {
    // TODO : to remove
    console.log(e);
    let hasClickedLayer = false;

    for (const layer of layers.toReversed()) {
      const targets = layer.groupRef.current.getAllIntersections(
        getCanvasPointerPosition(),
      );

      if (targets.length && !hasClickedLayer) {
        hasClickedLayer = true;
        updateLayer(layer.id, (prev) => {
          return {
            ...prev,
            isSelected: true,
          };
        });
      }
      // De-select all other layers
      else {
        updateLayer(layer.id, (prev) => {
          return {
            ...prev,
            isSelected: false,
          };
        });
      }
    }
  };

  // Drag handler for image
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (e: any) => {
    const node = e.target;
    const id = node.id();

    setLayers((prevLayers) => {
      const newlayers = [...prevLayers];
      const index = newlayers.findIndex((img) => img.id === id);
      if (index !== -1) {
        newlayers[index] = {
          ...newlayers[index],
          position: {
            x: node.x(),
            y: node.y(),
          },
        };
      }
      return newlayers;
    });
  };

  const handleMouseDown = (e: KonvaMouseEvent) => {
    e.evt.preventDefault();
    if (
      e.evt.button != CANVAS_DRAG_MOUSE_BUTTON ||
      nameSelectedTool != MOVE_TOOL.name
    ) {
      // TODO: Other cases will need to be handled (e.g. tool application)
      return;
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

  return (
    <div>
      <Stage
        className="bg-violet-200"
        // TODO : voir avec code d'Alessio si taille respectée et plus modifier la taille du canvas
        // FIXME: Find a way to use all available space
        height={1000}
        width={1000}
        onClick={handleStageClick}
        ref={stageRef}
      >
        {/* Unique Konva Layer of the stage representing the Canvas.
          EDIT Layers are "mapped" to Konva Groups */}
        <KonvaLayer
          ref={canvasRef}
          onClick={handleStageClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
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
                onDragEnd={handleDragEnd}
              />
            );
          })}

          {/* Canvas outline, drawn as a Konva element */}
          <Rect
            draggable={false}
            height={height}
            width={width}
            stroke={"#7c3aed"}
            strokeWidth={2}
            strokeEnabled={true /* TODO: Link with editor setting */}
          />
        </KonvaLayer>
      </Stage>
    </div>
  );
};

export default Canvas;
