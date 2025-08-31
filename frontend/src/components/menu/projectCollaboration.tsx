"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthorizedUsers } from "./authorizedUsers";
import type { Project } from "@/models/api/project/project";
import api from "@/lib/api";
import { ErrorComponent } from "../api/errorComponent";
import { LoadingComponent } from "../api/loadingComponent";
import type { AxiosError } from "axios";

type Mode = "all" | "owned" | "collab";

type Props = {
  mode: Mode; // "all" → /projects/accessible, "owned" → /projects/owned, "collab" → accessible - owned
};

function isAxiosError(err: unknown): err is AxiosError {
  return (
    typeof err === "object" &&
    err !== null &&
    "isAxiosError" in (err as Record<string, unknown>)
  );
}

export const ProjectCollaboration = ({ mode }: Props) => {
  const currentPage = usePathname().split("/")[1] ?? "";
  const params = useParams();

  // master lists
  const [accessibleProjects, setAccessibleProjects] = useState<
    Project[] | null
  >(null);
  const [ownedProjects, setOwnedProjects] = useState<Project[] | null>(null);

  // UI state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // fetch data according to mode
  useEffect(() => {
    let alive = true;

    const fetchAll = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        if (mode === "all") {
          const res = await api.get<Project[]>("/projects/accessible", {
            headers: { "Cache-Control": "no-store" },
          });
          if (!alive) return;
          if (res.status === 200) {
            const sorted = [...res.data].sort((a, b) =>
              a.projectName.localeCompare(b.projectName, "en", {
                sensitivity: "base",
              }),
            );
            setAccessibleProjects(sorted);
            setOwnedProjects(null);
          } else {
            setHasError(true);
          }
        } else if (mode === "owned") {
          const res = await api.get<Project[]>("/projects/owned", {
            headers: { "Cache-Control": "no-store" },
          });
          if (!alive) return;
          if (res.status === 200) {
            const sorted = [...res.data].sort((a, b) =>
              a.projectName.localeCompare(b.projectName, "en", {
                sensitivity: "base",
              }),
            );
            setOwnedProjects(sorted);
            setAccessibleProjects(null);
          } else {
            setHasError(true);
          }
        } else {
          // collab = accessible - owned
          const [accRes, ownRes] = await Promise.all([
            api.get<Project[]>("/projects/accessible", {
              headers: { "Cache-Control": "no-store" },
            }),
            api.get<Project[]>("/projects/owned", {
              headers: { "Cache-Control": "no-store" },
            }),
          ]);
          if (!alive) return;
          if (accRes.status === 200 && ownRes.status === 200) {
            const accSorted = [...accRes.data].sort((a, b) =>
              a.projectName.localeCompare(b.projectName, "en", {
                sensitivity: "base",
              }),
            );
            const ownSorted = [...ownRes.data].sort((a, b) =>
              a.projectName.localeCompare(b.projectName, "en", {
                sensitivity: "base",
              }),
            );
            setAccessibleProjects(accSorted);
            setOwnedProjects(ownSorted);
          } else {
            setHasError(true);
          }
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

    void fetchAll();
    return () => {
      alive = false;
    };
  }, [mode]);

  // choose the working list for the current mode
  const listForMode: Project[] = useMemo(() => {
    if (mode === "all") return accessibleProjects ?? [];
    if (mode === "owned") return ownedProjects ?? [];
    // collab
    const acc = accessibleProjects ?? [];
    const own = ownedProjects ?? [];
    const ownedIds = new Set<number>(own.map((p) => p.projectId));
    return acc.filter((p) => !ownedIds.has(p.projectId));
  }, [mode, accessibleProjects, ownedProjects]);

  // select a project by URL or default (first) when list changes
  useEffect(() => {
    if (listForMode.length === 0) {
      setSelectedProject(null);
      return;
    }
    if (currentPage === "projects") {
      setSelectedProject(listForMode[0]);
      return;
    }
    // e.g. /project/[projectId]
    const routePid = String(
      (params as Record<string, string | string[]>).projectId ?? "",
    );
    if (routePid) {
      const found = listForMode.find((p) => String(p.projectId) === routePid);
      setSelectedProject(found ?? null);
    } else {
      setSelectedProject(listForMode[0]);
    }
  }, [listForMode, currentPage, params]);

  if (hasError) {
    return <ErrorComponent subject="projects" />;
  }

  if (isLoading) {
    return <LoadingComponent />;
  }

  // empty states per mode
  if (listForMode.length === 0) {
    const label =
      mode === "all"
        ? "No accessible project found."
        : mode === "owned"
          ? "No owned project found."
          : "No collaborator project found.";
    return <p className="text-violet-50 font-bold text-xl">{label}</p>;
  }

  if (!selectedProject) {
    const label =
      currentPage === "projects"
        ? "Select a project to manage collaborators."
        : "You do not have access to this project in this view.";
    return <p className="text-violet-50 font-bold text-xl">{label}</p>;
  }

  return (
    <div className="flex flex-col justify-between gap-4">
      <div className="flex">
        <p className="text-violet-50 font-bold text-xl mb-2">
          Project collaboration{" "}
          {mode === "all"
            ? "(All)"
            : mode === "owned"
              ? "(Owned)"
              : "(Collaborator)"}
        </p>
      </div>

      {currentPage === "projects" && (
        <div className="flex flex-row justify-between">
          <div>
            <select
              className="bg-violet-500 text-violet-50 rounded p-2 cursor-pointer w-80"
              value={selectedProject.projectName}
              onChange={(e) => {
                const next =
                  listForMode.find((p) => p.projectName === e.target.value) ??
                  null;
                setSelectedProject(next);
              }}
            >
              {listForMode.map((p) => (
                <option key={p.projectId}>{p.projectName}</option>
              ))}
            </select>
          </div>
          <div>
            {selectedProject.thumbnail && (
              <img
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
