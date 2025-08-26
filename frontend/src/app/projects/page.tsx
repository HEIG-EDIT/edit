"use client";

import { ConfigurationButton } from "@/components/configurationButton";
import { ActionButton } from "@/components/actionButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { Menu } from "@/components/menu/menu";
import { useEffect, useState } from "react";
import { Project } from "@/models/api/project/project";
import api from "@/lib/api";

export default function ProjectSelection() {
  const [menuDisplay, setMenuDisplay] = useState<boolean>(false);

  const [projects, setProjects] = useState<Project[]>([]);

  // TODO : finir de gerer
  //const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      api.get("");
      // TODO : utiliser authentification
      api
        .get("/api/projects/accessible/1")
        .then((res) => setProjects(res.data))
        .catch(() => setHasError(true));
    };
    fetchData();
    // TODO : a supprimer
    console.log({ hasError });
  }, []);

  return (
    <main className="bg-gray-900 min-h-screen p-6">
      <div className="bg-gray-700 rounded-xl">
        <div className="bg-gray-600 flex flex-row rounded-xl p-4">
          <div className="w-1/4 flex flex-row items-center justify-start gap-12">
            <p className="text-violet-50 font-bold text-xl">Projects</p>
            {/* TODO : gerer logique pour creer un nouveau projet */}
            <ConfigurationButton icon={AddRoundedIcon} onClick={() => {}} />
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
        <div>{JSON.stringify(projects)}</div>
      </div>
      {menuDisplay && <Menu setMenuDisplay={setMenuDisplay} />}
    </main>
  );
}
