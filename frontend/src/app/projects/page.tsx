"use client";

import { ConfigurationButton } from "@/components/configurationButton";
import { ActionButton } from "@/components/actionButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { Menu } from "@/components/menu/menu";
import { useState } from "react";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useRouter } from "next/navigation";
import { Vector2d } from "konva/lib/types";

export default function ProjectSelection() {
  const [menuDisplay, setMenuDisplay] = useState<boolean>(false);

  const [isNewProjectDisplayed, setIsNewProjectDisplayed] = useState(false);
  const [projectSize, setProjectSize] = useState<Vector2d>();

  const router = useRouter();

  const projectCreationButton = (
    <ConfigurationButton
      icon={AddRoundedIcon}
      onClick={() => setIsNewProjectDisplayed(true)}
    />
  );

  const handleProjectCreation = () => {
    // TODO pass correct size
    router.push("editor");
  };

  const inputClassName = "w-24 rounded-md text-gray-900 bg-violet-200";

  const projectCreationPopup = (
    <div className="flex flex-row border-2 border-violet-300 p-2 bg-gray-500 rounded-xl">
      <div className="flex flex-col px-4 gap-4 justify-center text-violet-50">
        <div className="flex flex-row gap-4">
          <label htmlFor="width">Width: </label>
          <input
            className={inputClassName}
            name="width"
            id="width"
            type="number"
            min="1"
            defaultValue="800"
            onChange={(e) => {
              setProjectSize({ ...projectSize, x: Number(e.target.value) });
            }}
          />
        </div>

        <div className="flex flex-row gap-4">
          <label htmlFor="height">Height: </label>
          <input
            className={inputClassName}
            name="height"
            id="height"
            type="number"
            min="1"
            defaultValue="800"
            onChange={(e) => {
              setProjectSize({ ...projectSize, y: Number(e.target.value) });
            }}
          />
        </div>
      </div>

      <div className="flex flex-row gap-2">
        <ConfigurationButton
          icon={CheckRoundedIcon}
          onClick={handleProjectCreation}
        />
        <ConfigurationButton
          icon={CloseRoundedIcon}
          onClick={() => setIsNewProjectDisplayed(false)}
        />
      </div>
    </div>
  );

  return (
    <main className="bg-gray-900 min-h-screen p-6">
      <div className="bg-gray-700 rounded-xl">
        <div className="bg-gray-600 flex flex-row rounded-xl p-4">
          <div className="w-1/4 flex flex-row items-center justify-start gap-12">
            <p className="text-violet-50 font-bold text-xl">Projects</p>
            {isNewProjectDisplayed
              ? projectCreationPopup
              : projectCreationButton}
            <div className="text-violet-50 w-1/4"></div>
          </div>
          <div className="w-1/2"></div>
          <div className="w-1/4 flex flex-row items-center justify-start gap-12">
            <div className="flex flex-col gap-4">
              <div className="pl-2">
                <p className="text-violet-50">Sort by</p>
              </div>
              <div className="bg-white rounded-xl p-2">
                {/* TODO : gerer logique pour trier projets + affichage de la box */}
                <p className="text-black text-sm">...</p>
              </div>
            </div>
            <ActionButton
              icon={<MenuRoundedIcon style={{ color: "white" }} />}
              onClick={() => setMenuDisplay(true)}
              style="bg-violet-500 border-gray-800 border-violet-50"
            />
          </div>
        </div>
        {/* TODO : call endpoint pour recuperer projets selon current user + creer composant projectDescription */}
        <div>...</div>
      </div>
      {menuDisplay && <Menu setMenuDisplay={setMenuDisplay} />}
    </main>
  );
}
