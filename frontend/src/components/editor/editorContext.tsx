import { LayerId, LayerUpdateCallback } from "@/models/editor/layers/layer";
import { KonvaMouseEvent, EventType } from "@/models/editor/utils/events";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import React, { createContext, useContext } from "react";
import { Layer } from "@/models/editor/layers/layer";
import { VirtualStateSetter } from "@/hooks/useUndoRedo";

export type CanvasState = {
  scale: number;
  position: Vector2d;
};

export type EventHandlers = Partial<
  Record<EventType, (event?: KonvaMouseEvent) => void>
>;

// Define the complete context of the editor. This allows child components to edit
// what is needed in the whole editor.
interface EditorContextType {
  isHoldingPrimary: React.RefObject<boolean>;
  isTransforming: React.RefObject<boolean>;

  layers: Layer[];
  updateLayer: (
    id: LayerId,
    callback: LayerUpdateCallback,
    virtual?: boolean,
  ) => void;
  editSelectedLayers: (
    callback: LayerUpdateCallback,
    virtual?: boolean,
  ) => void;
  commitVirtualLayers: () => void;
  setVirtualLayers: VirtualStateSetter<Layer[]>;

  getCanvasPointerPosition: () => Vector2d;

  canvasState: CanvasState;
  setCanvasState: React.Dispatch<React.SetStateAction<CanvasState>>;
  stageRef: React.RefObject<Konva.Stage | null>;
  layerRef: React.RefObject<Konva.Layer | null>;

  toolEventHandlers: React.RefObject<EventHandlers>;
  setToolEventHandlers: (eventHandlers: EventHandlers) => void;
}

export const EditorContext = createContext<EditorContextType | null>(null);

export const useEditorContext = () => {
  const editorContext = useContext(EditorContext);

  if (!editorContext) {
    throw new Error("Trying to use editor context before intitialization.");
  }

  return editorContext;
};
