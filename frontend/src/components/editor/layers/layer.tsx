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

import { v2Sub } from "@/models/editor/layers/layerUtils";
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
      setIsTransforming,
      transformSelectedLayers,
    }: Partial<LayerProps> = props;
    const transformerRef = useRef<Konva.Transformer>(null);

    useEffect(() => {
      if (isSelected && groupRef) {
        transformerRef.current?.nodes([groupRef.current]);
      }
    }, [isSelected, groupRef]);

    const handleTransformEnd = () => {
      const node = groupRef?.current;

      const transformDiff = {
        scale: {
          x: node.scaleX() - scale.x,
          y: node.scaleY() - scale.y,
        },
        position: v2Sub(node.position(), position),
        rotation: node.rotation() - rotation,
      };

      transformSelectedLayers(transformDiff);
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
