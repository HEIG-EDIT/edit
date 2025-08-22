"use client";
import { forwardRef, useEffect, useRef, RefObject, useState } from "react";
import {
  Image as KonvaImage,
  Group as KonvaGroup,
  Line as KonvaLine,
  Transformer as KonvaTransformer,
  Rect as KonvaRect,
} from "react-konva";
import Konva from "konva";

import { v2Add, v2Sub } from "@/models/editor/layers/layerUtils";
import { LayerProps, TransformDiff } from "@/models/editor/layers/layerProps";
import { useEditorContext } from "../editorContext";
import { CROP_TOOL, CropToolTransformer } from "../tools/crop";

export const LayerComponent = forwardRef<Konva.Group, LayerProps>(
  (props, ref) => {
    const {
      id,
      position,
      rotation,
      scale,
      image,
      isVisible,
      isSelected,
      lines,
      crop,
    }: Partial<LayerProps> = props;

    const { editSelectedLayers, isTransforming, toolName, updateLayer } = useEditorContext();

    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

    // Get image dimensions when image loads
    useEffect(() => {
      if (image) {
        setImageSize({
          width: image.width || image.naturalWidth,
          height: image.height || image.naturalHeight
        });
      }
    }, [image]);

    const groupRef = ref as RefObject<Konva.Group>;
    const transformerRef = useRef<Konva.Transformer>(null);
    const cropTransformerRef = useRef(null);

    const cropRectRef = useRef<Konva.Rect>(null);

    const transformSelectedLayers = (diff: TransformDiff) => {
      editSelectedLayers((layer) => {
        return {
          ...layer,
          scale: v2Add(layer.scale, diff.scale),
          position: v2Add(layer.position, diff.position),
          rotation: layer.rotation + diff.rotation,
        };
      });
    };

    useEffect(() => {
      if (isSelected) {
        if (cropRectRef.current && cropTransformerRef.current && toolName == CROP_TOOL.name) {
          cropTransformerRef.current.nodes([cropRectRef.current])
        } else if (groupRef.current && transformerRef.current) {
          transformerRef.current?.nodes([groupRef?.current]);
        }
      }
    }, [isSelected, groupRef, transformerRef]);

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

    const handleCropTransformEnd = () => {
      const rect = cropRectRef?.current;
      if (rect) {
        const newCrop = {
          x: rect.x(),
          y: rect.y(),
          width: rect.width() * rect.scaleX(),
          height: rect.height() * rect.scaleY(),
        };

        // Reset the rectangle's scale to 1 after applying the crop
        rect.scaleX(1);
        rect.scaleY(1);

        updateLayer(id, (layer) => {
          return {
            ...layer,
            crop: newCrop,
          }
        });
      }
    };

    const effectiveCrop = crop || {
      x: 0,
      y: 0,
      width: imageSize.width,
      height: imageSize.height
    };

    return (
      <>
        {isSelected && isVisible && (toolName == CROP_TOOL.name &&
          <KonvaTransformer
            ref={cropTransformerRef}
            onTransformEnd={handleCropTransformEnd}
            rotateEnabled={false}
          />)
          ||
          (
            <KonvaTransformer
              ref={transformerRef}
              onTransformStart={() => {
                isTransforming.current = true;
              }}
              onTransformEnd={handleTransformEnd}
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
          clipFunc={(ctx) => {
            ctx.rect(
              effectiveCrop.x,
              effectiveCrop.y,
              effectiveCrop.width,
              effectiveCrop.height
            );
          }}
          scale={scale}
          rotation={rotation}
          width={image.width}
          height={image.height}
          id={id}
          ref={ref}
          visible={isVisible}
        >
          {/* Dummy rectangle, used to select layers with Canvas click */}
          <KonvaRect
            ref={cropRectRef}
            x={effectiveCrop.x}
            y={effectiveCrop.y}
            width={effectiveCrop.width}
            height={effectiveCrop.height}
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
              globalCompositeOperation={line.tool}
            />
          ))}
        </KonvaGroup>
      </>
    );
  },
);

LayerComponent.displayName = "LayerComponent";
