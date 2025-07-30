"use client";
import { useRef, forwardRef } from "react";
const reactConva = require("react-konva");
import {
  Image as KonvaImage,
  Layer as KonvaLayer,
  Line as KonvaLine,
} from "react-konva";
import { Line } from "./types";

interface LayerProps {
  image: HTMLImageElement;
  ref: any;
  id: string;
  x: number;
  y: number;
  onDragEnd: any;
  draggable: boolean;
  lines: Array<Line>;
}

export const LayerComponent = forwardRef((props, ref) => {
  const { image, x, y, id, lines, onDragEnd, draggable }: LayerProps = props;
  console.log(`Lines: ${lines}`);
  return (
    <KonvaLayer
      x={x}
      y={y}
      id={id}
      onDragEnd={onDragEnd}
      draggable={draggable}
      ref={ref}
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
    </KonvaLayer>
  );
});
