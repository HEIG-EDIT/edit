"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect, useCallback } from "react";
import { LoadImageButton } from "@/components/editor/loadImageButton";

import { MOVE_TOOL } from "@/components/editor/tools/move";
import { CROP_TOOL } from "@/components/editor/tools/crop";
import { SELECT_CURSOR_TOOL } from "@/components/editor/tools/select-cursor";
import { PAINT_TOOL } from "@/components/editor/tools/paint";
import { ERASE_TOOL } from "@/components/editor/tools/erase";
import { PAINT_BUCKET_TOOL } from "@/components/editor/tools/paint-bucket";
import { ADJUST_TOOL } from "@/components/editor/tools/adjust";

import { ToolsManagement } from "@/components/editor/tools/toolsManagement";
import { LayersManagement } from "@/components/editor/layers/layersManagement";

import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";

import { Menu } from "@/components/editor/menu/menu";
import { Toolbar } from "@/components/editor/toolbar/toolbar";

import {
  Layer,
  LayerId,
  LayerUpdateCallback,
} from "@/models/editor/layers/layer";
import { useUndoRedo } from "@/components/editor/undoRedo";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TOOLS: Record<string, Tool<any>> = {
  [MOVE_TOOL.name]: MOVE_TOOL,
  [CROP_TOOL.name]: CROP_TOOL,
  [SELECT_CURSOR_TOOL.name]: SELECT_CURSOR_TOOL,
  [PAINT_TOOL.name]: PAINT_TOOL,
  [ERASE_TOOL.name]: ERASE_TOOL,
  [PAINT_BUCKET_TOOL.name]: PAINT_BUCKET_TOOL,
  [ADJUST_TOOL.name]: ADJUST_TOOL,
};

const TOOLS_INITIAL_STATE: Record<string, ToolConfiguration> = {};

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

  // TODO : to remove, usefull to pass deployment with eslint check (" x is assigned a value but never used.  @typescript-eslint/no-unused-vars")
  console.log(setVirtualLayers);
  console.log(commitVirtualLayers);

  const [nameSelectedTool, setNameSelectedTool] = useState<string>(
    MOVE_TOOL.name,
  );
  const [toolsConfiguration, setToolsConfiguration] =
    useState<Record<string, ToolConfiguration>>(TOOLS_INITIAL_STATE);
  const [menuDisplay, setMenuDisplay] = useState<boolean>(false);

  // TODO : a supprimer des que gestion du state global ok
  useEffect(() => console.log(toolsConfiguration), [toolsConfiguration]);

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
    (layerId: LayerId, callback: LayerUpdateCallback) => {
      const [i, layer] = findLayer(layerId);
      const newLayer = callback(layer);

      setLayers((prev: Layer[]) => [
        ...prev.slice(0, i),
        newLayer,
        ...prev.slice(i + 1),
      ]);
    },
    [findLayer, setLayers],
  );

  return (
    <main className="bg-gray-900 min-h-screen">
      <div className="flex flex-row">
        <div className="flex-1">
          <div className="flex flex-col p-4">
            <div className="mb-6 flex items-center justify-center">
              <LoadImageButton setLayers={setLayers} />
            </div>
            <div className="mb-6">
              <ToolsManagement
                nameSelectedTool={nameSelectedTool}
                toolsConfiguration={toolsConfiguration}
                setToolsConfiguration={setToolsConfiguration}
              />
            </div>
            <div>
              <LayersManagement layers={layers} updateLayer={updateLayer} />
            </div>
          </div>
        </div>
        <div className="flex-3">
          <div className="mb-6 mr-4">
            <Canvas
              layers={layers}
              setLayers={setLayers}
              updateLayer={updateLayer}
              nameSelectedTool={nameSelectedTool}
              height={1000}
              width={1000}
            />
          </div>
          <div className="flex items-center justify-center">
            <Toolbar
              undo={undo}
              canUndo={canUndo}
              redo={redo}
              canRedo={canRedo}
              nameSelectedTool={nameSelectedTool}
              setNameSelectedTool={setNameSelectedTool}
              setMenuDisplay={setMenuDisplay}
            />
          </div>
        </div>
      </div>
      {menuDisplay && <Menu setMenuDisplay={setMenuDisplay} />}
    </main>
  );
}
