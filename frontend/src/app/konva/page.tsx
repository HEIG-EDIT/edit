"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import { LoadImageButton } from "../../components/konva/loadImageButton";

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

export default function EditorPage() {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <main className="bg-gray-900 min-h-screen">
      <div className="p-4">
        <LoadImageButton setImages={setImages} />
      </div>
      <Canvas
        images={images}
        setImages={setImages}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </main>
  );
}
