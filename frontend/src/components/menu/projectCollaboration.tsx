"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthorizedUsers } from "./authorizedUsers";
import type { Project } from "@/models/api/project/project";
import api from "@/lib/api";
import { ErrorComponent } from "../api/errorComponent";
import { LoadingComponent } from "../api/loadingComponent";
import type { AxiosError } from "axios";
import Image from "next/image";

function isAxiosError(err: unknown): err is AxiosError {
  return (
    typeof err === "object" &&
    err !== null &&
    "isAxiosError" in (err as Record<string, unknown>)
  );
}

export const ProjectCollaboration = () => {
  const currentPage = usePathname().split("/")[1];
  const params = useParams();

  const [ownedProjects, setOwnedProjects] = useState<Project[] | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let alive = true;

    const fetchData = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const res = await api.get<Project[]>("/projects/owned", {
          headers: { "Cache-Control": "no-store" },
        });
        if (!alive) return;
        if (res.status === 200) {
          if (res.data.length > 0) {
            const sorted = [...res.data].sort((a, b) =>
              a.projectName.localeCompare(b.projectName, "en", {
                sensitivity: "base",
              }),
            );
            setOwnedProjects(sorted);
          }
        } else {
          setHasError(true);
        }
      } catch (err) {
        if (isAxiosError(err)) {
          // Respect backend statuses: 401/403/404 → show your generic error component as before
          // You can branch per status if you want more specific copy.
          // const status = err.response?.status;
        }
        if (alive) setHasError(true);
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    void fetchData();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (ownedProjects && ownedProjects.length > 0) {
      if (currentPage === "projects") {
        setSelectedProject(ownedProjects[0]);
      } else {
        const urlProject = ownedProjects.find(
          (p) => String(p.projectId) === params.projectId,
        );
        if (urlProject !== undefined) {
          setSelectedProject(urlProject);
        }
      }
    }
  }, [ownedProjects, params.projectId]);

  if (hasError) {
    return <ErrorComponent subject="projects" />;
  }

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (currentPage === "projects" && !ownedProjects) {
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

      {currentPage === "projects" && (
        <div className="flex flex-row justify-between">
          <div>
            <select
              className="bg-violet-500 text-violet-50 rounded p-2 cursor-pointer w-80"
              value={selectedProject.projectName}
              onChange={(e) => {
                setSelectedProject(
                  ownedProjects?.find(
                    (p) => p.projectName === e.target.value,
                  ) || null,
                );
              }}
            >
              {ownedProjects?.map((p: Project) => {
                return <option key={p.projectId}>{p.projectName}</option>;
              })}
            </select>
          </div>
          <div>
            {selectedProject.thumbnail && (
              <Image
                src={`data:image/png;base64,${selectedProject.thumbnail}`}
                width={160}
                height={90}
                className="object-cover mr-6"
                alt="Project thumbnail"
              />
            )}
          </div>
        </div>
      )}

      <div className="bg-gray-700 rounded-xl p-2 mb-4">
        <AuthorizedUsers projectId={selectedProject.projectId} />
      </div>
    </div>
  );
};
