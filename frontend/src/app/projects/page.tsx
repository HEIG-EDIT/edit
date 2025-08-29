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

export default function ProjectSelection() {
  const [menuDisplay, setMenuDisplay] = useState<boolean>(false);

  const [projects, setProjects] = useState<Project[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

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

  return (
    <main className="bg-gray-900 min-h-screen p-6">
      <div className="bg-gray-700 rounded-xl">
        <div className="bg-gray-600 flex flex-row rounded-xl p-4 items-center justify-between">
          <div className="flex flex-row gap-12 items-center">
            <p className="text-violet-50 font-bold text-xl">Projects</p>
            {/* TODO : gerer logique pour creer un nouveau projet */}
            <ConfigurationButton icon={AddRoundedIcon} onClick={() => {}} />
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
