import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";
import { KonvaMouseEvent } from "@/models/editor/utils/events";
import OpenWithRoundedIcon from "@mui/icons-material/OpenWithRounded";
import { useEditorContext } from "../editorContext";
import { useState, useCallback, useRef } from "react";
import { Vector2d } from "konva/lib/types";
import { v2Add, v2Sub } from "@/models/editor/layers/layerUtils";

export type MoveToolConfiguration = ToolConfiguration;

export const MoveToolConfigurationComponent = ({
  configuration,
  setConfiguration,
}: ToolConfigurationProps<MoveToolConfiguration>) => {
  // TODO : to remove, just for eslink check
  console.log(configuration);
  console.log(setConfiguration);

  const {
    isHoldingPrimary,
    isTransforming,
    editSelectedLayers,
    setToolEventHandlers,
    getCanvasPointerPosition,
    commitVirtualLayers,
    setVirtualLayers,
    stageRef,
    updateLayer,
  } = useEditorContext();

  const [layerDragStartPosition, setLayerDragStartPosition] =
    useState<Vector2d>({
      x: 0,
      y: 0,
    });

  const isDraggingLayers = useRef(false);

  // Determine whether or not the mouse is dragging across the canvas. The
  // mouse needs to move past a certain threshold before the action is
  // considered a drag and not a click.
  const getLayerDragPositionDiff = useCallback(() => {
    const canvasPosition = getCanvasPointerPosition();
    return v2Sub(canvasPosition, layerDragStartPosition);
  }, [getCanvasPointerPosition, layerDragStartPosition]);

  // Click handler for stage handling layer selection
  const handleLayerSelection = (e: KonvaMouseEvent | undefined) => {
    if (!e?.evt.ctrlKey) {
      // Start by de-selecting all layers
      setVirtualLayers((prev) => {
        return prev.map((layer) => {
          return {
            ...layer,
            isSelected: false,
          };
        });
      });
    }

    const pointer = stageRef.current?.getPointerPosition();
    if (!pointer) {
      return;
    }

    const target = stageRef.current?.getIntersection(pointer);

    if (target) {
      const layerId = target.parent?.id();
      if (!layerId) {
        return;
      }
      updateLayer(
        layerId,
        (prev) => {
          return {
            ...prev,
            isSelected: true,
          };
        },
        true,
      );
    }
  };

  const handleMouseDown = () => {
    setLayerDragStartPosition(getCanvasPointerPosition());
    isHoldingPrimary.current = true;

    editSelectedLayers((layer) => {
      if (!layer.isSelected) {
        return layer;
      }
      return {
        ...layer,
        positionBeforeDrag: {
          x: layer.position.x,
          y: layer.position.y,
        },
      };
    }, true);
  };

  const handleMouseMove = () => {
    if (isHoldingPrimary.current) {
      const positionDiff = getLayerDragPositionDiff();

      // Not dragging
      // FIXME: Maybe update threshold?
      if (Math.hypot(positionDiff.x, positionDiff.y) < 2) {
        return;
      }

      isDraggingLayers.current = true;

      editSelectedLayers((layer) => {
        return {
          ...layer,
          position: v2Add(layer.positionBeforeDrag, positionDiff),
        };
      }, true);

      return;
    }
  };

  const handleMouseUp = (e: KonvaMouseEvent | undefined) => {
    if (isTransforming.current) {
      isTransforming.current = false;
      return;
    }

    if (isDraggingLayers.current) {
      commitVirtualLayers();
      isDraggingLayers.current = false;
    } else {
      return handleLayerSelection(e);
    }
  };

  setToolEventHandlers({
    mouseDown: handleMouseDown,
    mouseMove: handleMouseMove,
    mouseUp: handleMouseUp,
  });

  return (
    <div>
      <p className="text-violet-50">
        {" "}
        No configuration available for this tool!
      </p>
    </div>
  );
};

export const MOVE_TOOL: Tool<MoveToolConfiguration> = {
  name: "Move",
  icon: <OpenWithRoundedIcon style={{ color: "white" }} />,
  initialConfiguration: {},
  configurationComponent: MoveToolConfigurationComponent,
};
