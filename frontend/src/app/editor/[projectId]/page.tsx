"use client";

import Konva from "konva";
import dynamic from "next/dynamic";
import React, { useState, useEffect, useCallback, useRef } from "react";

import { MOVE_TOOL } from "@/components/editor/tools/move";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";

import { ToolsManagement } from "@/components/editor/tools/toolsManagement";
import { LayersManagement } from "@/components/editor/layers/layersManagement";

import { Menu } from "@/components/menu/menu";
import { Toolbar } from "@/components/editor/toolbar/toolbar";

import {
  Layer,
  LayerId,
  LayerUpdateCallback,
} from "@/models/editor/layers/layer";
import { useUndoRedo } from "@/components/editor/undoRedo";
import { TOOLS, TOOLS_INITIAL_STATE } from "@/models/editor/utils/tools";

import {
  EditorContext,
  CanvasState,
  EventHandlers,
} from "@/components/editor/editorContext";
import { Vector2d } from "konva/lib/types";

const Canvas = dynamic(() => import("@/components/editor/canvas"), {
  ssr: false,
});

export interface LoadedImage {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

for (const tool of Object.values(TOOLS)) {
  TOOLS_INITIAL_STATE[tool.name] = tool.initialConfiguration;
}

export default function EditorPage() {
  const {
    state: layers,
    setState: setLayers,
    setVirtualState: setVirtualLayers,
    commitVirtualState: commitVirtualLayers,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo(Array<Layer>());

  const [nameSelectedTool, setNameSelectedTool] = useState<string>(
    MOVE_TOOL.name,
  );
  const [toolsConfiguration, setToolsConfiguration] =
    useState<Record<string, ToolConfiguration>>(TOOLS_INITIAL_STATE);
  const [menuDisplay, setMenuDisplay] = useState<boolean>(false);

  const isHoldingPrimary = useRef(false);
  const isTransforming = useRef(false);

  const toolEventHandlers = useRef<EventHandlers>({});

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<Vector2d>({ x: 0, y: 0 });

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ x: width, y: height });
      }
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // TODO : a supprimer des que gestion du state global ok
  useEffect(() => console.log(toolsConfiguration), [toolsConfiguration]);

  const layerRef = useRef<Konva.Layer>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    position: {
      x: 0,
      y: 0,
    },
    scale: 1,
  });

  const setToolEventHandlers = (eventHandlers: EventHandlers) => {
    toolEventHandlers.current = eventHandlers;
  };

  const getCanvasPointerPosition = () => {
    const stagePosition = stageRef?.current?.getPointerPosition();
    if (!stagePosition) {
      // Should not happen
      throw new Error("Could not get the stage pointer position");
    }

    const canvas = canvasState;

    return {
      x: (stagePosition.x - canvas.position.x) / canvas.scale,
      y: (stagePosition.y - canvas.position.y) / canvas.scale,
    };
  };

  /// Find the layer's state and it's index in the list from it's id
  const findLayer = useCallback(
    (layerId: string): [number, Layer] => {
      for (const [i, layer] of layers.entries()) {
        if (layer.id === layerId) {
          return [i, layer];
        }
      }

      throw Error(`Could not find layer with id ${layerId}`);
    },
    [layers],
  );

  const updateLayer = useCallback(
    (
      layerId: LayerId,
      callback: LayerUpdateCallback,
      virtual: boolean = false,
    ) => {
      const [i, layer] = findLayer(layerId);
      const newLayer = callback(layer);

      const fun = virtual ? setVirtualLayers : setLayers;

      fun((prev: Layer[]) => [
        ...prev.slice(0, i),
        newLayer,
        ...prev.slice(i + 1),
      ]);
    },
    [findLayer, setLayers, setVirtualLayers],
  );

  const editSelectedLayers = (
    callback: LayerUpdateCallback,
    virtual: boolean = false,
  ) => {
    const fun = virtual ? setVirtualLayers : setLayers;
    fun((prev) => {
      return prev.map((layer) => {
        if (!layer.isSelected) {
          return layer;
        }
        return callback(layer);
      });
    });
  };

  return (
    <main className="bg-gray-900 min-h-screen">
      <EditorContext
        value={{
          isHoldingPrimary,
          isTransforming,

          layers,
          setVirtualLayers,
          updateLayer,
          editSelectedLayers,
          commitVirtualLayers,

          getCanvasPointerPosition,

          canvasState,
          setCanvasState,
          stageRef,
          layerRef,

          toolEventHandlers,
          setToolEventHandlers,
        }}
      >
        <div className="flex flex-row gap-4 px-4">
          <div className="w-1/3">
            <div className="flex flex-col gap-6">
              <ToolsManagement
                nameSelectedTool={nameSelectedTool}
                toolsConfiguration={toolsConfiguration}
                setToolsConfiguration={setToolsConfiguration}
              />
              <LayersManagement
                layers={layers}
                updateLayer={updateLayer}
                setLayers={setLayers}
                canvasSize={canvasSize}
              />
            </div>
          </div>
          <div className="w-2/3">
            <div className="flex flex-col gap-4 h-screen">
              <div className="h-5/6" ref={canvasContainerRef}>
                <Canvas
                  layers={layers}
                  setVirtualLayers={setVirtualLayers}
                  commitVirtualLayers={commitVirtualLayers}
                  updateLayer={updateLayer}
                  nameSelectedTool={nameSelectedTool}
                  width={canvasSize.x}
                  height={canvasSize.y}
                />
              </div>
              <div className="flex justify-center">
                <Toolbar
                  undo={undo}
                  canUndo={canUndo}
                  redo={redo}
                  canRedo={canRedo}
                  nameSelectedTool={nameSelectedTool}
                  setNameSelectedTool={setNameSelectedTool}
                  setMenuDisplay={setMenuDisplay}
                  canvasSize={canvasSize}
                />
              </div>
            </div>
          </div>
        </div>
        {menuDisplay && <Menu setMenuDisplay={setMenuDisplay} />}
      </EditorContext>
    </main>
  );
}
