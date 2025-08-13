"use client";
import { forwardRef } from "react";
import {
  Image as KonvaImage,
  Group as KonvaGroup,
  Line as KonvaLine,
} from "react-konva";
import { Line, Layer, LayerId } from "../types";
import { Vector2d } from "konva/lib/types";

interface LayerProps {
  id: LayerId;
  position: Vector2d;
  rotation: number;
  scale: Vector2d;
  image: HTMLImageElement;
  isVisible: boolean;
  lines: Line[];

  onDragEnd: any;
  onTransformEnd: any;
}

export const LayerComponent = forwardRef((props: LayerProps, ref) => {
  const {
    id,
    position,
    rotation,
    scale,
    image,
    isVisible,
    lines,

    onDragEnd,
    onTransformEnd,
  }: Partial<LayerProps> = props;
  return (
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
      ref={ref}
      visible={isVisible}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
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
  );
});
