import { useEditorContext } from "../editorContext";
import { Layer } from "@/models/editor/layers/layer";
import { useRef } from "react";
import { PaintToolConfiguration } from "./paint";
import { EraseToolConfiguration } from "./erase";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { Line } from "@/models/editor/layers/line";

type PaintEraseBaseProps<T extends ToolConfiguration> = {
  toolConfiguration: ToolConfigurationProps<T>;
};

export const PaintEraseBaseComponent = <
  T extends PaintToolConfiguration | EraseToolConfiguration,
>({
  toolConfiguration,
}: PaintEraseBaseProps<T>) => {
  const {
    editSelectedLayers,
    setToolEventHandlers,
    commitVirtualLayers,
    layers,
  } = useEditorContext();

  const isDrawing = useRef(false);
  const { configuration } = toolConfiguration;

  const isPaintTool = "color" in configuration;

  const getLayerCursorPosition = (layer: Layer) => {
    let position = layer.groupRef.current?.getRelativePointerPosition();
    const layerSize = layer.groupRef.current?.size();

    if (!position || !layerSize) {
      throw new Error("Could not get cursor position or layer size");
    }

    position = {
      x: Math.max(0, Math.min(position.x, layerSize.width)),
      y: Math.max(0, Math.min(position.y, layerSize.height)),
    };

    return position;
  };

  const handleMouseDown = () => {
    // If no layer is selected, don't set isDrawing in order to not update the history
    let hasSelectedLayer = false;
    for (const layer of layers) {
      if (layer.isSelected) {
        hasSelectedLayer = true;
        break;
      }
    }

    if (!hasSelectedLayer) {
      return;
    }

    isDrawing.current = true;

    editSelectedLayers((layer) => {
      const pointPosition = getLayerCursorPosition(layer);
      const line: Partial<Line> = {
        points: [pointPosition.x, pointPosition.y],
        width: configuration.radius,
        color: "0x000", // This is needed otherwise the eraser fails
      };

      // tool property reference: https://konvajs.org/docs/react/Free_Drawing.html
      if (isPaintTool) {
        console.log("IsPaintTool");
        line.color = configuration.color;
        line.tool = "source-over";
      } else {
        line.tool = "destination-out";
      }

      return {
        ...layer,
        lines: layer.lines.concat([line as Line]),
      };
    }, true);
  };

  const handleMouseMove = () => {
    if (!isDrawing.current) {
      return;
    }

    // TODO: Restrict drawing to inside the layer
    editSelectedLayers((layer) => {
      const pointPosition = getLayerCursorPosition(layer);
      const lines = layer.lines.slice();
      const currentLine = lines[lines.length - 1];
      currentLine.points = currentLine.points.concat([
        pointPosition.x,
        pointPosition.y,
      ]);

      layer.lines = lines;
      return layer;
    }, true);
  };

  const handleMouseUp = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      commitVirtualLayers();
    }
  };

  setToolEventHandlers({
    mouseDown: handleMouseDown,
    mouseMove: handleMouseMove,
    mouseUp: handleMouseUp,
  });

  // Logic component only, don't render anything
  return <></>;
};
