"use client";

import dynamic from "next/dynamic";
import React, {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { LoadImageButton } from "@/components/editor/loadImageButton";
import { ToolSelector } from "@/components/editor/toolSelector";
import { OutsideCard } from "@/components/outsideCard";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
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

import { Layer, LayerId } from "@/components/editor/types";

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
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<LayerId | null>(null);

  const [nameSelectedTool, setNameSelectedTool] = useState<string>(
    MOVE_TOOL.name,
  );
  const [toolsConfiguration, setToolsConfiguration] =
    useState<Record<string, ToolConfiguration>>(TOOLS_INITIAL_STATE);
  const [menuState, setMenuState] = useState<boolean>(false);

  // TODO : a supprimer des que gestion du state global ok
  useEffect(() => console.log(toolsConfiguration), [toolsConfiguration]);

  const ToolConfigurationComponent =
    TOOLS[nameSelectedTool].configurationComponent;

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
    (layerId: LayerId, callback: (layer: Layer) => Layer) => {
      const [i, layer] = findLayer(layerId);
      const newLayer = callback(layer);

      setLayers((prev) => [
        ...prev.slice(0, i),
        newLayer,
        ...prev.slice(i + 1),
      ]);
    },
    [findLayer, setLayers],
  );

  return (
    <main className="bg-gray-900 min-h-screen">
      <div className="grid grid-cols-5">
        <div className="col-span-1 flex flex-col gap-4 px-4">
          <LoadImageButton setLayers={setLayers} />
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
            layers={layers}
            setLayers={setLayers}
            updateLayer={updateLayer}
            selectedLayer={selectedLayer}
            setSelectedLayer={setSelectedLayer}
            nameSelectedTool={nameSelectedTool}
            // TODO: Add a way to choose the size
            width={1000}
            height={1000}
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
