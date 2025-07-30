"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { LoadImageButton } from "../../components/konva/loadImageButton";
import { OptionSelector } from "../../components/konva/optionSelector";
import { OutsideCard } from "../../components/outsideCard";

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

export type Option = {
  name: string;
  iconPath: string;
};

export const Options: Record<string, Option> = {
  move: {
    name: "move",
    iconPath: "/editor/toolbar/move.svg",
  },
  crop: {
    name: "crop",
    iconPath: "/editor/toolbar/crop.svg",
  },
  paint: {
    name: "paint",
    iconPath: "/editor/toolbar/paint.svg",
  },
  erase: {
    name: "erase",
    iconPath: "/editor/toolbar/erase.svg",
  },
  "paint-bucket": {
    name: "paint-bucket",
    iconPath: "/editor/toolbar/paint-bucket.svg",
  },
  "select-cursor": {
    name: "select-cursor",
    iconPath: "/editor/toolbar/select-cursor.svg",
  },
  adjust: {
    name: "adjust",
    iconPath: "/editor/toolbar/adjust.svg",
  },
};

export default function EditorPage() {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [option, setOption] = useState<Option>(Options.move);

  // TODO : remove after all ok
  useEffect(() => console.log(option), [option]);

  return (
    <main className="bg-gray-900 min-h-screen">
      <div className="container mx-auto p-4">
        <div className="p-4">
          <LoadImageButton setImages={setImages} />
        </div>
        <Canvas
          images={images}
          setImages={setImages}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          option={option}
        />
        <OutsideCard>
          <OptionSelector option={option} setOption={setOption} />
        </OutsideCard>
      </div>
    </main>
  );
}
