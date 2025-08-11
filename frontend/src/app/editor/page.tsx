"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { LoadImageButton } from "@/components/editor/loadImageButton";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";

import { MOVE_TOOL } from "@/components/editor/tools/move";
import { CROP_TOOL } from "@/components/editor/tools/crop";
import { SELECT_CURSOR_TOOL } from "@/components/editor/tools/select-cursor";
import { PAINT_TOOL } from "@/components/editor/tools/paint";
import { ERASE_TOOL } from "@/components/editor/tools/erase";
import { PAINT_BUCKET_TOOL } from "@/components/editor/tools/paint-bucket";
import { ADJUST_TOOL } from "@/components/editor/tools/adjust";
import { LayersManagment } from "@/components/editor/layers/layersManagment";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { Tool } from "@/models/editor/tools/tool";
import { Menu } from "@/components/editor/menu/menu";
import { Toolbar } from "@/components/editor/toolbar/toolbar";

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

for (let tool of Object.values(TOOLS)) {
  TOOLS_INITIAL_STATE[tool.name] = tool.initialConfiguration;
}

export default function EditorPage() {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [nameSelectedTool, setNameSelectedTool] = useState<string>(
    MOVE_TOOL.name,
  );
  const [toolsConfiguration, setToolsConfiguration] =
    useState<Record<string, ToolConfiguration>>(TOOLS_INITIAL_STATE);
  const [menuDisplay, setMenuDisplay] = useState<boolean>(false);

  // TODO : a supprimer des que gestion du state global ok
  useEffect(() => console.log(toolsConfiguration), [toolsConfiguration]);

  const ToolConfigurationComponent =
    TOOLS[nameSelectedTool].configurationComponent;

  return (
    <main className="bg-gray-900 min-h-screen">
      <div className="grid grid-cols-5">
        <div className="col-span-1 flex flex-col gap-4 px-4">
          <LoadImageButton setImages={setImages} />
          {/* TODO : mettre dans nouveau composant ToolsManagment mais state ko ensuite... */}
          <div className="bg-gray-800 rounded-2xl">
            <div className="bg-violet-300 rounded-2xl p-2 flex flex-row gap-4 mb-2">
              <ConstructionRoundedIcon />
              <p className="text-grey-800 font-semibold text-xl">
                Tool configuration
              </p>
            </div>
            <div className="p-4">
              <div className="bg-gray-600 rounded-2xl">
                <p className="text-violet-50 font-bold flex justify-center text-xl py-2">
                  {nameSelectedTool}
                </p>
                <div className="p-4">
                  <ToolConfigurationComponent
                    configuration={toolsConfiguration[nameSelectedTool]}
                    setConfiguration={(config: ToolConfiguration) =>
                      setToolsConfiguration((prev) => ({
                        ...prev,
                        [nameSelectedTool]: config,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <LayersManagment />
        </div>
        <div className="col-span-4">
          <div className="mb-6">
            <Canvas
              images={images}
              setImages={setImages}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              nameSelectedTool={nameSelectedTool}
            />
          </div>
          <div className="mb-6 flex justify-center items-center">
            <Toolbar
              nameSelectedTool={nameSelectedTool}
              setNameSelectedTool={setNameSelectedTool}
              setMenuDisplay={setMenuDisplay}
            />
          </div>
        </div>
        {menuDisplay && <Menu setMenuDisplay={setMenuDisplay} />}
      </div>
    </main>
  );
}
