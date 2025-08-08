"use client";

import React, { useRef } from "react";
import { LoadedImage } from "@/app/editor/page";

type Props = {
  setImages: React.Dispatch<React.SetStateAction<LoadedImage[]>>;
};

export const LoadImageButton = ({ setImages }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.src = reader.result as string;
      img.onload = () => {
        setImages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`,
            image: img,
            x: 0,
            y: 0,
            width: img.width,
            height: img.height,
            rotation: 0,
          },
        ]);
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <button
        onClick={handleUploadClick}
        className="bg-violet-500 hover:bg-violet-300 text-violet-50 font-bold rounded-full px-4 py-2 border-2 border-violet-50"
      >
        Upload an image
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};
