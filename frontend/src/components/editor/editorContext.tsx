import { LayerUpdateCallback } from "@/models/editor/layers/layer";
import { KonvaMouseEvent } from "@/models/editor/utils/events";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { createContext, useContext } from "react";

export type CanvasState = {
  scale: number;
  position: Vector2d;
};

interface EditorContextType {
  editSelectedLayers: (callback: LayerUpdateCallback, virtual?: boolean) => void;
  getCanvasPointerPosition: () => Vector2d;
  handleLayerSelection: (e: KonvaMouseEvent) => void;
  canvasState: CanvasState;
  setCanvasState: React.Dispatch<React.SetStateAction<CanvasState>>;
  stageRef: React.RefObject<Konva.Stage | null>;
};

export const EditorContext = createContext<EditorContextType | null>(null);

export const useEditorContext = () => {
  const editorContext = useContext(EditorContext);

  if (!editorContext) {
    throw new Error("Trying to use editor context before intitialization.");
  }

  return editorContext;
}
