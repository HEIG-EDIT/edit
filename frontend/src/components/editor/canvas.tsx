// use https://konvajs.org/docs/select_and_transform/Basic_demo.html

"use client";

import React, { useRef, useEffect } from "react";
import { Stage, Layer as KonvaLayer, Image, Transformer } from "react-konva";
import Konva from "konva";
import { LoadedImage } from "@/app/editor/page";
import { Layer } from "./types";

type CanvasProps = {
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  selectedLayer: string | null;
  setSelectedLayer: React.Dispatch<React.SetStateAction<string | null>>;
  nameSelectedTool: string;
};

export const Canvas = ({
  layers: layers,
  setLayers: setLayers,
  selectedLayer: selectedLayer,
  setSelectedLayer: setSelectedLayer,
  nameSelectedTool,
}: CanvasProps) => {
  const transformerRef = useRef<any>(null);
  const imageRefs = useRef<Map<string, Konva.Image>>(new Map());

  // Update transformer (blue bounding box around the image) when selection changes
  useEffect(() => {
    if (transformerRef.current) {
      if (selectedLayer) {
        const node = imageRefs.current.get(selectedLayer);
        transformerRef.current.nodes([node]);
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedLayer]);

  // Click handler for stage
  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      setSelectedLayer(null);
      return;
    }

    if (e.target.hasName("image")) {
      const clickedId = e.target.id();
      setSelectedLayer(clickedId);
      return;
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
  const handleTransformEnd = (e: any) => {
    const node = e.target;
    const id = node.id();

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    setLayers((prevImages) => {
      const newImages = [...prevImages];
      const index = newImages.findIndex((img) => img.id === id);

      if (index !== -1) {
        const originalWidth = newImages[index].width;
        const originalHeight = newImages[index].height;

        newImages[index] = {
          ...newImages[index],
          position: {
            x: node.x(),
            y: node.y(),
          },
          rotation: node.rotation(),
          // FIXME
          width: Math.max(5, originalWidth * scaleX),
          height: Math.max(5, originalHeight * scaleY),
        };
      }

      return newImages;
    });
  };

  return (
    <div>
      <Stage
        className="bg-violet-200"
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={handleStageClick}
      >
        <KonvaLayer>
          {layers.map((layer) => (
            <Image
              key={layer.id}
              id={layer.id}
              name={"image"}
              x={layer.position.x}
              y={layer.position.y}
              image={layer.image}
              width={layer.image.width}
              height={layer.image.height}
              rotation={layer.rotation}
              draggable
              ref={(node) => {
                if (node) {
                  imageRefs.current.set(layer.id, node);
                }
              }}
              onDragEnd={handleDragEnd}
              onTransformEnd={handleTransformEnd}
            />
          ))}

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
