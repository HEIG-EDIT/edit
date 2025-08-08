// use https://konvajs.org/docs/select_and_transform/Basic_demo.html

"use client";

import React, { useRef, useEffect } from "react";
import { Stage, Layer, Image, Transformer } from "react-konva";
import Konva from "konva";
import { LoadedImage } from "@/app/editor/page";

type CanvasProps = {
  images: LoadedImage[];
  setImages: React.Dispatch<React.SetStateAction<LoadedImage[]>>;
  selectedImage: string | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>;
  nameSelectedTool: string;
};

export const Canvas = ({
  images,
  setImages,
  selectedImage,
  setSelectedImage,
  nameSelectedTool,
}: CanvasProps) => {
  const transformerRef = useRef<any>(null);
  const imageRefs = useRef<Map<string, Konva.Image>>(new Map());

  // Update transformer (blue bounding box around the image) when selection changes
  useEffect(() => {
    if (transformerRef.current) {
      if (selectedImage) {
        const node = imageRefs.current.get(selectedImage);
        transformerRef.current.nodes([node]);
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedImage]);

  // Click handler for stage
  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      setSelectedImage(null);
      return;
    }

    if (e.target.hasName("image")) {
      const clickedId = e.target.id();
      setSelectedImage(clickedId);
      return;
    }
  };

  // Drag handler for image
  const handleDragEnd = (e: any) => {
    const node = e.target;
    const id = node.id();

    setImages((prevImages) => {
      const newImages = [...prevImages];
      const index = newImages.findIndex((img) => img.id === id);
      if (index !== -1) {
        newImages[index] = {
          ...newImages[index],
          x: node.x(),
          y: node.y(),
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

    setImages((prevImages) => {
      const newImages = [...prevImages];
      const index = newImages.findIndex((img) => img.id === id);

      if (index !== -1) {
        const originalWidth = newImages[index].width;
        const originalHeight = newImages[index].height;

        newImages[index] = {
          ...newImages[index],
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
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
        <Layer>
          {images.map((img) => (
            <Image
              key={img.id}
              id={img.id}
              name={"image"}
              x={img.x}
              y={img.y}
              image={img.image}
              width={img.width}
              height={img.height}
              rotation={img.rotation}
              draggable
              ref={(node) => {
                if (node) {
                  imageRefs.current.set(img.id, node);
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
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;
