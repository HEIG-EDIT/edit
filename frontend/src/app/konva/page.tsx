"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect, ReactNode } from "react";
import { LoadImageButton } from "../../components/konva/loadImageButton";
import { ToolSelector } from "../../components/konva/toolSelector";
import { OutsideCard } from "../../components/outsideCard";

import {
  MoveTool,
  MoveToolConfiguration,
} from "../../components/konva/tools/move";
import {
  CropTool,
  CropToolConfiguration,
} from "../../components/konva/tools/crop";
import {
  SelectCursorTool,
  SelectCursorToolConfiguration,
} from "../../components/konva/tools/select-cursor";
import {
  PaintTool,
  PaintToolConfiguration,
} from "../../components/konva/tools/paint";
import {
  EraseTool,
  EraseToolConfiguration,
} from "../../components/konva/tools/erase";
import {
  PaintBucketTool,
  PaintBucketToolConfiguration,
} from "../../components/konva/tools/paint-bucket";
import {
  AdjustTool,
  AdjustToolConfiguration,
} from "../../components/konva/tools/adjust";

const Canvas = dynamic(() => import("../../components/konva/canvas"), {
  ssr: false,
});

export type LoadedImage = {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export type ToolConfiguration =
  | MoveToolConfiguration
  | CropToolConfiguration
  | SelectCursorToolConfiguration
  | PaintToolConfiguration
  | EraseToolConfiguration
  | PaintBucketToolConfiguration
  | AdjustToolConfiguration;

export interface Tool<T extends ToolConfiguration = ToolConfiguration> {
  name: string;
  iconPath: string;
  initialConfiguration: T;
  configurationComponent: React.FC<{
    configuration: T;
    setConfiguration: (config: T) => void;
  }>;
}

export const Tools: Record<string, Tool> = {
  [MoveTool.name]: MoveTool,
  [CropTool.name]: CropTool,
  [SelectCursorTool.name]: SelectCursorTool,
  [PaintTool.name]: PaintTool,
  [EraseTool.name]: EraseTool,
  [PaintBucketTool.name]: PaintBucketTool,
  [AdjustTool.name]: AdjustTool,
};

export default function EditorPage() {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [nameSelectedTool, setNameSelectedTool] = useState<string>(
    MoveTool.name,
  );

  const [toolsConfiguration, setToolsConfiguration] = useState<
    Record<string, ToolConfiguration>
  >({
    [MoveTool.name]: MoveTool.initialConfiguration,
    [CropTool.name]: CropTool.initialConfiguration,
    [SelectCursorTool.name]: SelectCursorTool.initialConfiguration,
    [PaintTool.name]: PaintTool.initialConfiguration,
    [EraseTool.name]: EraseTool.initialConfiguration,
    [PaintBucketTool.name]: PaintBucketTool.initialConfiguration,
    [AdjustTool.name]: AdjustTool.initialConfiguration,
  });

  // TODO : remove after all ok
  useEffect(() => console.log(toolsConfiguration), [toolsConfiguration]);

  const ToolConfigurationComponent =
    Tools[nameSelectedTool].configurationComponent;

  return (
    <main className="bg-gray-900 min-h-screen">
      <div className="grid grid-cols-5">
        <div className="col-span-1">
          <div className="p-4">
            <LoadImageButton setImages={setImages} />
            <OutsideCard>
              <ToolConfigurationComponent
                configuration={toolsConfiguration[nameSelectedTool]}
                setConfiguration={(config: ToolConfiguration) =>
                  setToolsConfiguration((prev) => ({
                    ...prev,
                    [nameSelectedTool]: config,
                  }))
                }
              />
            </OutsideCard>
            <OutsideCard>TODO : layers</OutsideCard>
          </div>
        </div>
        <div className="col-span-4">
          <Canvas
            images={images}
            setImages={setImages}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            nameSelectedTool={nameSelectedTool}
          />
          <div className="py-6 flex justify-center">
            <OutsideCard>
              <ToolSelector
                nameSelectedTool={nameSelectedTool}
                setNameSelectedTool={setNameSelectedTool}
              />
            </OutsideCard>
          </div>
        </div>
      </div>
    </main>
  );
}
