"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect, ReactNode } from "react";
import { LoadImageButton } from "../../components/konva/loadImageButton";
import { ToolSelector } from "../../components/konva/toolSelector";
import { OutsideCard } from "../../components/outsideCard";

import { MoveTool } from "../../components/konva/tools/move";
import { CropTool } from "../../components/konva/tools/crop";
import { PaintTool } from "../../components/konva/tools/paint";
import { EraseTool } from "../../components/konva/tools/erase";
import { PaintBucketTool } from "../../components/konva/tools/paint-bucket";
import { SelectCursorTool } from "../../components/konva/tools/select-cursor";
import { AdjustTool } from "../../components/konva/tools/adjust";

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

export interface Tool {
  name: string;
  iconPath: string;
  configurationComponent: ReactNode;
}

export const Tools: Record<string, Tool> = {
  [MoveTool.name]: MoveTool,
  [CropTool.name]: CropTool,
  [PaintTool.name]: PaintTool,
  [EraseTool.name]: EraseTool,
  [PaintBucketTool.name]: PaintBucketTool,
  [SelectCursorTool.name]: SelectCursorTool,
  [AdjustTool.name]: AdjustTool,
};

export default function EditorPage() {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>(Tools.move);

  // TODO : remove after all ok
  useEffect(() => console.log(selectedTool), [selectedTool]);

  return (
    <main className="bg-gray-900 min-h-screen">
      <div className="grid grid-cols-5">
        <div className="col-span-1">
          <div className="p-4">
            <LoadImageButton setImages={setImages} />
            <OutsideCard>{selectedTool.configurationComponent}</OutsideCard>
            <OutsideCard>TODO : layers</OutsideCard>
          </div>
        </div>
        <div className="col-span-4">
          <Canvas
            images={images}
            setImages={setImages}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            selectedTool={selectedTool}
          />
          <div className="py-6 flex justify-center">
            <OutsideCard>
              <ToolSelector
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
              />
            </OutsideCard>
          </div>
        </div>
      </div>
    </main>
  );
}
