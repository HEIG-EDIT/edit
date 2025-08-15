"use client";
import { forwardRef } from "react";
import {
  Image as KonvaImage,
  Group as KonvaGroup,
  Line as KonvaLine,
} from "react-konva";

import { LayerProps } from "@/models/editor/layers/layerProps";

// TODO : replace "any" to another type due to :
/* Type error: Type 'ForwardedRef<unknown>' is not assignable to type 'Ref<Group> | undefined'.
#11 17.90   Type 'RefObject<unknown>' is not assignable to type 'Ref<Group> | undefined'.
#11 17.90     Type 'RefObject<unknown>' is not assignable to type 'RefObject<Group | null>'.
#11 17.90       Type 'unknown' is not assignable to type 'Group | null'.*/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LayerComponent = forwardRef((props: LayerProps, ref: any) => {
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

LayerComponent.displayName = "LayerComponent";
