import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthorizedUsers } from "./authorizedUsers";
import { Project } from "@/models/api/project/project";
import api from "@/lib/api";
import { ErrorComponent } from "../api/errorComponent";
import { LoadingComponent } from "../api/loadingComponent";

export const ProjectCollaboration = () => {
  const currentPage = usePathname().split("/")[1];

  const params = useParams();

  const [ownerProjects, setOwnerProjects] = useState<Project[] | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // UPDATE fetch to get only owned projects
        // It uses authentication token to get the user id
        const res = await api.get("/projects/owned");
        if (res.data.length > 0) {
          setOwnerProjects(
            res.data.sort((p1: Project, p2: Project) =>
              p1.projectName.localeCompare(p2.projectName, "en", {
                sensitivity: "base",
              }),
            ),
          );
        }
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (ownerProjects && ownerProjects.length > 0) {
      if (currentPage == "projects") {
        setSelectedProject(ownerProjects[0]);
      } else {
        const urlProject = ownerProjects.find(
          (p) => String(p.projectId) === params.projectId,
        );
        if (urlProject !== undefined) {
          setSelectedProject(urlProject);
        }
      }
    }
  }, [ownerProjects, params.projectId]);

  if (hasError) {
    return <ErrorComponent subject="projects" />;
  }

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (currentPage == "projects" && !ownerProjects) {
    return (
      <p className="text-violet-50 font-bold text-xl">
        No owned project found.
      </p>
    );
  }

  if (!selectedProject) {
    return (
      <p className="text-violet-50 font-bold text-xl">
        Not owner of this project.
      </p>
    );
  }

  return (
    <div className="flex flex-col justify-between gap-4">
      <div className="flex">
        <p className="text-violet-50 font-bold text-xl mb-2">
          Project collaboration
        </p>
      </div>
      {currentPage == "projects" && (
        <div className="flex flex-row justify-between">
          <div>
            <select
              className="bg-violet-500 text-violet-50 rounded p-2 cursor-pointer w-80"
              value={selectedProject?.projectName}
              onChange={(e) => {
                setSelectedProject(
                  ownerProjects?.find((p) => p.projectName == e.target.value) ||
                    null,
                );
              }}
            >
              {ownerProjects?.map((p: Project) => {
                return <option key={p.projectId}>{p.projectName}</option>;
              })}
            </select>
          </div>
          <div>
            <img
              src={`data:image/png;base64,${selectedProject?.thumbnail}`}
              width={160}
              height={90}
              className="object-cover mr-6"
            />
          </div>
        </div>
      )}
      <div className="bg-gray-700 rounded-xl p-2 mb-4">
        <AuthorizedUsers projectId={selectedProject?.projectId} />
      </div>
    </div>
  );
};
