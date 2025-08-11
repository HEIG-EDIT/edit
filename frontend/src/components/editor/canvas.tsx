// use https://konvajs.org/docs/select_and_transform/Basic_demo.html

"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Stage,
  Layer as KonvaLayer,
  Rect,
  Image,
  Transformer,
} from "react-konva";
import Konva from "konva";
import KonvaEventObject from "konva";
import { Layer, LayerId } from "./types";
import { LayerComponent } from "./layers/layer";
import { Vector2d } from "konva/lib/types";

type CanvasProps = {
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  updateLayer: (id: LayerId, callback: (layer: Layer) => Layer) => null;
  nameSelectedTool: string;
  height: number;
  width: number;
};

type CanvasState = {
  scale: number;
  position: Vector2d;
};

type KonvaMouseEvent = KonvaEventObject.KonvaEventObject<MouseEvent>;

export const Canvas = ({
  layers: layers,
  setLayers: setLayers,
  updateLayer,
  nameSelectedTool,
  width,
  height,
}: CanvasProps) => {
  const transformerRef = useRef<any>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const canvasRef = useRef<Konva.Layer>(null);

  const [canvasState, setCanvasState] = useState<CanvasState>({
    scale: 1,
    position: {
      x: 0,
      y: 0,
    },
  });

  // Update transformer (blue bounding box around the image) when selection changes
  useEffect(() => {
    console.log(layers);
    if (transformerRef.current) {
      let nodes = [];
      for (const layer of layers) {
        if (layer.isSelected) {
          console.log("Layer is selected: ", layer.name);
          nodes.push(layer.groupRef.current);
        }
      }
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [layers]);

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
    let hasClickedLayer = false;

    for (const layer of layers) {
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
  const handleDragEnd = (e: any) => {
    const node = e.target;
    const id = node.id();

    setLayers((prevImages) => {
      const newImages = [...prevImages];
      const index = newImages.findIndex((img) => img.id === id);
      if (index !== -1) {
        newImages[index] = {
          ...newImages[index],
          position: {
            x: node.x(),
            y: node.y(),
          },
        };
      }
      return newImages;
    });
  };

  // Resize + Rotate handler for image
  // TODO: Maybe move transformers to LayerComponent? If we want to select multiple layers it will be required
  const handleTransformEnd = (e: any) => {
    const node = e.target;
    const id = node.id();

    updateLayer(id, (layer: Layer) => {
      return {
        ...layer,
        scale: {
          x: node.scaleX(),
          y: node.scaleY(),
        },
        rotation: node.rotation(),
        position: {
          x: node.x(),
          y: node.y(),
        },
      };
    });
  };

  return (
    <div>
      <Stage
        className="bg-violet-200"
        width={window.innerWidth}
        height={window.innerHeight}
        // onClick={handleStageClick}
        ref={stageRef}
      >
        {/* Unique Konva Layer of the stage representing the Canvas.
          EDIT Layers are "mapped" to Konva Groups */}
        <KonvaLayer
          ref={canvasRef}
          onClick={handleStageClick}
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
          {layers.map((layer) => (
            <LayerComponent
              id={layer.id}
              key={layer.id}
              position={layer.position}
              rotation={layer.rotation}
              scale={layer.scale}
              image={layer.image}
              isVisible={layer.isVisible}
              lines={layer.lines}
              ref={layer.groupRef}
              onDragEnd={handleDragEnd}
              onTransformEnd={handleTransformEnd}
              // setSelected={() => updateLayer(layer.id)}
            />
          ))}

          {/* Canvas outline, drawn as a Konva element */}
          <Rect
            draggable={false}
            height={height}
            width={width}
            stroke={"#7c3aed"}
            strokeWidth={2}
            strokeEnabled={true /* TODO: Link with editor setting */}
          />
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </KonvaLayer>
      </Stage>
    </div>
  );
};

export default Canvas;
