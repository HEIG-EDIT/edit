"use client";
import { forwardRef, useEffect, useRef } from "react";
import {
  Image as KonvaImage,
  Group as KonvaGroup,
  Line as KonvaLine,
  Transformer as KonvaTransformer,
} from "react-konva";
import Konva from "konva";

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

      onDragEnd,
    }: Partial<LayerProps> = props;
    const transformerRef = useRef<Konva.Transformer>(null);

    useEffect(() => {
      if (isSelected && groupRef) {
        transformerRef.current?.nodes([groupRef.current]);
      }
    }, [isSelected]);

    return (
      <>
        <KonvaGroup
          listening
          x={position.x}
          y={position.y}
          scale={scale}
          rotation={rotation}
          width={image.width}
          height={image.height}
          id={id}
          // FIXME: This will probably not work when moving multiple layers
          draggable
          ref={groupRef}
          visible={isVisible}
          onDragEnd={onDragEnd}
        >
          <KonvaImage image={image} />
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
        {isSelected && (
          <KonvaTransformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        )}
      </>
    );
  },
);

LayerComponent.displayName = "LayerComponent";
