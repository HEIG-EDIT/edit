import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthorizedUsers } from "./authorizedUsers";
import { EntryButton } from "./entryButton";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import { Project } from "@/models/api/project/project";
import api from "@/lib/api";
import { ErrorComponent } from "../api/errorComponent";
import { LoadingComponent } from "../api/loadingComponent";

export const ProjectCollaboration = () => {
  const currentPage = usePathname().split("/")[1];

  const [projects, setProjects] = useState<Project[] | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO : utiliser authentification
        const res = await api.get("/api/projects/accessible/1");
        setProjects(
          res.data.sort((p1: Project, p2: Project) =>
            p1.projectName.localeCompare(p2.projectName, "en", {
              sensitivity: "base",
            }),
          ),
        );
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (projects && projects.length > 0) {
      setSelectedProject(projects[0]);
    }
  }, [projects]);

  if (hasError) {
    return <ErrorComponent subject="projects" />;
  }

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    // TODO : afficher uniquement projets ou user=owner et si aucun projet alors owner nul part et message

    <div className="flex flex-col justify-between gap-4">
      <div className="flex">
        <p className="text-violet-50 font-bold text-xl mb-2">
          Project collaboration
        </p>
      </div>
      {currentPage == "projects" && (
        <div className="flex flex-row justify-between">
          <div>
            {/* TODO : gerer ... pour rester dans parent + gerer scroll vertical si beaucoup de projets + gerer image */}
            <select
              className="bg-violet-500 text-violet-50 rounded p-2 cursor-pointer w-24"
              value={selectedProject?.projectName}
              onChange={(e) => {
                setSelectedProject(
                  projects?.find((p) => p.projectName == e.target.value) ||
                    null,
                );
              }}
            >
              {projects?.map((p: Project) => {
                return <option key={p.projectId}>{p.projectName}</option>;
              })}
            </select>
          </div>
          <div>
            <img
              src={`data:image/png;base64,${selectedProject?.thumbnail}`}
              width={160}
              height={90}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      )}
      <div className="bg-gray-700 rounded-xl p-2 mb-4">
        <AuthorizedUsers />
      </div>
      {/* TODO : gerer logique pour download projet */}
      {currentPage != "projects" && (
        <div className="flex w-fit mx-auto">
          <EntryButton
            icon={<FileDownloadRoundedIcon />}
            text="Download project"
            onClick={() => {}}
            style={"bg-violet-50 border-2 border-violet-500"}
          />
        </div>
      )}
    </div>
  );
};
