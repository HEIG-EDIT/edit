"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { LoadImageButton } from "@/components/editor/loadImageButton";
import { ToolSelector } from "@/components/editor/toolSelector";
import { OutsideCard } from "@/components/outsideCard";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";

import {
  MoveTool,
  MoveToolConfiguration,
} from "@/components/editor/tools/move";
import {
  CropTool,
  CropToolConfiguration,
} from "@/components/editor/tools/crop";
import {
  SelectCursorTool,
  SelectCursorToolConfiguration,
} from "@/components/editor/tools/select-cursor";
import {
  PaintTool,
  PaintToolConfiguration,
} from "@/components/editor/tools/paint";
import {
  EraseTool,
  EraseToolConfiguration,
} from "@/components/editor/tools/erase";
import {
  PaintBucketTool,
  PaintBucketToolConfiguration,
} from "@/components/editor/tools/paint-bucket";
import {
  AdjustTool,
  AdjustToolConfiguration,
} from "@/components/editor/tools/adjust";
import { LayersManagment } from "@/components/editor/layers/layersManagment";

const Canvas = dynamic(() => import("@/components/editor/canvas"), {
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

// TODO : mettre tous les type / interface ailleurs sous types.tsx ?

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

  const [menuState, setMenuState] = useState<boolean>(false);

  // TODO : a supprimer des que gestion du state global ok
  useEffect(() => console.log(toolsConfiguration), [toolsConfiguration]);

  const ToolConfigurationComponent =
    Tools[nameSelectedTool].configurationComponent;

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
              {/* TODO : gerer le style du bouton et creer un composant bouton stylise */}
              <button
                className="rounded-xl border-2 p-2"
                key={"burger"}
                onClick={() => setMenuState(true)}
              >
                <MenuRoundedIcon />
              </button>
            </OutsideCard>
          </div>
        </div>
        {menuState && <Menu setMenuState={setMenuState} />}
      </div>
    </main>
  );
}

// TODO : creer un composant ailleurs et gerer le state
const Menu = ({
  setMenuState,
}: {
  setMenuState: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div>
      <div className="fixed inset-0 bg-black opacity-80 z-50" />

      {/* TODO : configurer pop up */}
      <div className="fixed inset-0 flex justify-center items-center z-100">
        <div className="relative bg-gray-600 rounded-2xl border border-violet-300 p-2 w-2/3 h-2/3">
          <div className="flex flex-row gap-6 p-4 h-full">
            <div className="rounded-2xl bg-gray-900 w-1/3">PLOP</div>
            <div className="w-2/3">
              <UserSettings />
            </div>
          </div>

          <div className="absolute top-4 right-4">
            <button onClick={() => setMenuState(false)}>
              <CloseRoundedIcon style={{ color: "white", fontSize: "large" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// TODO : creer un composant ailleurs et gerer le state
const UserSettings = () => {
  return <div className="">Hello user</div>;
};
