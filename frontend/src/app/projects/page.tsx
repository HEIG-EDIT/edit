"use client";

import { ConfigurationButton } from "@/components/configurationButton";
import { ActionButton } from "@/components/actionButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { Menu } from "@/components/menu/menu";
import { useEffect, useMemo, useState } from "react";
import { Project } from "@/models/api/project/project";
import api from "@/lib/api";
import { ListProjects } from "@/components/projects/listProjects";
import { LoadingComponent } from "@/components/api/loadingComponent";
import { ErrorComponent } from "@/components/api/errorComponent";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useRouter } from "next/navigation";
import { Vector2d } from "konva/lib/types";

export default function ProjectSelection() {
  const router = useRouter();

  const [menuDisplay, setMenuDisplay] = useState<boolean>(false);

  const [projects, setProjects] = useState<Project[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const [isNewProjectDisplayed, setIsNewProjectDisplayed] = useState(false);
  const [projectSize, setProjectSize] = useState<Vector2d>({ x: 800, y: 800 });
  const [projectName, setProjectName] = useState<string>("project");
  const [projectId, setProjectId] = useState<number | null>(null);

  type sortType = Record<
    string,
    {
      description: string;
      sortFunction: (p1: Project, p2: Project) => number;
    }
  >;

  // TODO : tester la logique des tris
  const SORTING_TYPES: sortType = {
    nameAsc: {
      description: "Project name (A-Z)",
      sortFunction: (p1, p2) =>
        p1.projectName.localeCompare(p2.projectName, "en", {
          sensitivity: "base",
        }),
    },
    nameDesc: {
      description: "Project name (Z-A)",
      sortFunction: (p1, p2) =>
        p2.projectName.localeCompare(p1.projectName, "en", {
          sensitivity: "base",
        }),
    },
    lastSavedAtAsc: {
      description: "Last saved date (oldest first)",
      sortFunction: (p1, p2) => {
        if (p1.lastSavedAt == null) {
          return -1;
        } else if (p2.lastSavedAt == null) {
          return 1;
        } else {
          return (
            new Date(p1.lastSavedAt).getTime() -
            new Date(p2.lastSavedAt).getTime()
          );
        }
      },
    },
    lastSavedAtDesc: {
      description: "Last saved date (newest first)",
      sortFunction: (p1, p2) => {
        if (p1.lastSavedAt == null) {
          return 1;
        } else if (p2.lastSavedAt == null) {
          return -1;
        } else {
          return (
            new Date(p2.lastSavedAt).getTime() -
            new Date(p1.lastSavedAt).getTime()
          );
        }
      },
    },
  };

  const [selectedSortType, setSelectedSortType] = useState<string>("nameAsc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO : @Elbu -> utiliser authentification
        const res = await api.get("/api/projects/accessible/1");
        setProjects(res.data);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const sortedProjects = useMemo(() => {
    if (!projects) return null;
    return [...projects].sort(SORTING_TYPES[selectedSortType].sortFunction);
  }, [projects, selectedSortType]);

  const updateProjectName = (projectId: number, newProjectName: string) => {
    setProjects((prev) =>
      prev
        ? prev.map((p) =>
            p.projectId === projectId
              ? { ...p, projectName: newProjectName }
              : p,
          )
        : prev,
    );
  };

  const deleteProject = (projectId: number) => {
    setProjects((prev) =>
      prev ? prev.filter((p) => p.projectId !== projectId) : prev,
    );
  };

  const ProjectsView = () => {
    return (
      <div className="p-4">
        {isLoading ? (
          <LoadingComponent />
        ) : hasError ? (
          <ErrorComponent subject="projects" />
        ) : sortedProjects ? (
          <ListProjects
            projects={sortedProjects}
            updateProjectName={updateProjectName}
            deleteProject={deleteProject}
          />
        ) : (
          <></>
        )}
      </div>
    );
  };

  const projectCreationButton = (
    <ConfigurationButton
      icon={AddRoundedIcon}
      onClick={() => setIsNewProjectDisplayed(true)}
    />
  );

  // TODO : limiter taille du projet en fonction de la taille de l'ecran de l'utilisateur
  // TODO : passer dimensions du projet
  // TODO : adapter page editor
  const handleProjectCreation = async () => {
    try {
      // TODO : utiliser id du user
      const res = await api.post("/api/projects", {
        name: projectName,
        creatorId: 1,
      });
      setProjectId(res.data.id);
    } catch {
      // TODO : gerer si erreur cote backend
    } finally {
      setIsNewProjectDisplayed(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      router.push(`/editor/${projectId}`);
    }
  }, [projectId]);

  const projectCreationPopup = (
    <div className="flex flex-row border-2 border-violet-300 p-2 bg-gray-500 rounded-xl gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2 items-center">
          <p className="text-violet-50">Width:</p>
          <input
            className="w-24 rounded-xl text-gray-900 bg-violet-300 p-1"
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
        <div className="flex flex-row gap-2 items-center">
          <p className="text-violet-50">Height:</p>
          <input
            className="w-24 rounded-xl text-gray-900 bg-violet-300 p-1"
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
        <div className="flex flex-row gap-2 items-center">
          <p className="text-violet-50">Project name:</p>
          <input
            className="w-24 rounded-xl text-gray-900 bg-violet-300 p-1"
            type="text"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="inline-flex items-center justify-center">
        <ConfigurationButton
          icon={CheckRoundedIcon}
          onClick={handleProjectCreation}
        />
      </div>
      <div className="inline-flex items-center justify-center">
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
        <div className="bg-gray-600 flex flex-row rounded-xl p-4 items-center justify-between">
          <div className="flex flex-row gap-12 items-center">
            <p className="text-violet-50 font-bold text-xl">Projects</p>
            {isNewProjectDisplayed
              ? projectCreationPopup
              : projectCreationButton}
          </div>
          <div className="flex flex-row gap-12 items-center">
            <div className="flex flex-col gap-2">
              <p className="text-violet-50 font-bold pl-2">Sort by</p>
              <select
                className="bg-violet-500 text-violet-50 rounded-xl p-2 cursor-pointer"
                value={selectedSortType}
                onChange={(e) => {
                  setSelectedSortType(e.target.value);
                }}
              >
                {Object.entries(SORTING_TYPES).map(([key, option]) => (
                  <option key={key} value={key}>
                    {option.description}
                  </option>
                ))}
              </select>
            </div>
            <ActionButton
              icon={<MenuRoundedIcon style={{ color: "white" }} />}
              onClick={() => setMenuDisplay(true)}
              style="bg-violet-500 border-gray-800 border-violet-50"
            />
          </div>
        </div>
        <ProjectsView />
      </div>
      {menuDisplay && <Menu setMenuDisplay={setMenuDisplay} />}
    </main>
  );
}
