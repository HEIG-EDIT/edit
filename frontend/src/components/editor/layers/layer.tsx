"use client";
import { forwardRef, useEffect, useRef } from "react";
import {
  Image as KonvaImage,
  Group as KonvaGroup,
  Line as KonvaLine,
  Transformer as KonvaTransformer,
  Rect as KonvaRect,
} from "react-konva";
import Konva from "konva";

import { Layer } from "@/models/editor/layers/layer";
import { LayerProps } from "@/models/editor/layers/layerProps";

export const LayerComponent = forwardRef<Konva.Group, LayerProps>(
  (props, groupRef) => {
    const {
      id,
      position,
      rotation,
      scale,
      image,
      isVisible,
      isSelected,
      lines,
      updateLayer,
      setIsTransforming,
    }: Partial<LayerProps> = props;
    const transformerRef = useRef<Konva.Transformer>(null);

    useEffect(() => {
      if (isSelected && groupRef) {
        transformerRef.current?.nodes([groupRef.current]);
      }
    }, [isSelected, groupRef]);

    const handleTransformEnd = () => {
      const node = groupRef?.current;

      updateLayer((layer: Layer) => {
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
      <>
        {isSelected && isVisible && (
          <KonvaTransformer
            onTransformStart={() => {
              setIsTransforming(true);
            }}
            onTransformEnd={handleTransformEnd}
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        )}
        <KonvaGroup
          listening
          x={position.x}
          y={position.y}
          scale={scale}
          rotation={rotation}
          width={image.width}
          height={image.height}
          id={id}
          ref={groupRef}
          visible={isVisible}
        >
          {/* Dummy rectangle, used to select layers with Canvas click */}
          <KonvaRect
            width={image.width}
            height={image.height}
            fill={"transparent"}
            listening
          />
          <KonvaImage listening={false} image={image} />
          {lines?.map((line, i) => (
            <KonvaLine
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.width}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={"source-over"}
            />
          ))}
        </KonvaGroup>
      </>
    );
  },
);

LayerComponent.displayName = "LayerComponent";
