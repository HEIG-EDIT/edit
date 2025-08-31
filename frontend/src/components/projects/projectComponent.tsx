import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import Link from "next/link";
import colors from "tailwindcss/colors";
import { useState } from "react";
import api from "@/lib/api";
import { ConfirmDeletePopUp } from "./confirmDeletePopUp";
import type { ProjectProps } from "@/models/projects/projectProps";
import { isAxiosError, statusMessage } from "@/lib/auth.tools"; // ELBU UPDATED

// TODO : taille du composant a adapter selon taille de la thumbnail

export const ProjectComponent = ({
  project,
  updateProjectName,
  deleteProject,
}: ProjectProps) => {
  const lastModifiedDate = project.lastSavedAt
    ? format(new Date(project.lastSavedAt), "dd.MM.yy 'at' HH:mm", {
        locale: enUS,
      })
    : "-";

  const [currentProjectName, setCurrentProjectName] = useState<string>(
    project.projectName,
  );

  const [isProjectNameEditing, setIsProjectNameEditing] =
    useState<boolean>(false);

  const [confirmDeleteDisplay, setConfirmDeleteDisplay] =
    useState<boolean>(false);

  const [renameError, setRenameError] = useState<string | null>(null); // ADDED

  const saveProjectName = async (projectId: number, newProjectName: string) => {
    if (!newProjectName || newProjectName === project.projectName) {
      setCurrentProjectName(project.projectName);
      setIsProjectNameEditing(false);
      setRenameError(null);
      return;
    }
    try {
      setRenameError(null);
      // ELBU UPDATED: match backend DTO → { projectId, name }
      // endpoint returns 204 No Content
      const res = await api.patch<void>("/projects/rename", {
        projectId,
        name: newProjectName.trim(),
      });
      if (res.status === 204) {
        updateProjectName(projectId, newProjectName.trim());
      }
    } catch (e) {
      const msg = isAxiosError(e)
        ? statusMessage(e.response?.status)
        : "Rename failed.";
      setRenameError(msg);
      setCurrentProjectName(project.projectName);
    } finally {
      setIsProjectNameEditing(false);
    }
  };

  return (
    <div
      className={[
        "w-[160px] h-[160px] rounded-2xl bg-gray-600 border-2 flex flex-col overflow-hidden",
        renameError ? "border-red-400" : "border-violet-400",
      ].join(" ")}
      title={renameError ?? undefined}
    >
      <Link
        href={`/editor/${project.projectId}`}
        className="w-[160px] h-[90px] overflow-hidden cursor-pointer"
      >
        <img
          src={
            project.thumbnail
              ? `data:image/png;base64,${project.thumbnail}`
              : "/placeholder-thumb.png" // ELBU UPDATED: fallback avoids broken image when thumbnail missing
          }
          width={160}
          height={90}
          className="object-cover w-full h-full"
          alt="Project thumbnail"
        />
      </Link>
      <div className="border-2 border-violet-300" />
      <div className="h-[70px] flex flex-row items-center px-2">
        <div className="flex flex-col flex-1 min-w-0 items-start justify-center">
          {isProjectNameEditing ? (
            <input
              className="font-bold text-violet-50 text-sm text-left w-full bg-transparent outline-none"
              value={currentProjectName}
              autoFocus
              onChange={(e) => setCurrentProjectName(e.target.value)}
              onBlur={() =>
                void saveProjectName(project.projectId, currentProjectName)
              }
            />
          ) : (
            <p
              className="font-bold text-violet-50 text-sm text-left truncate w-full"
              title={project.projectName}
              onClick={() => setIsProjectNameEditing(true)}
            >
              {currentProjectName}
            </p>
          )}
          <p className="text-sm text-violet-400 text-left w-full cursor-default">
            {lastModifiedDate}
          </p>
        </div>
        <button
          className="flex-shrink-0 cursor-pointer"
          onClick={() => setConfirmDeleteDisplay(true)}
          aria-label="Delete project"
          title="Delete project"
        >
          <DeleteRoundedIcon style={{ color: colors.violet[300] }} />
        </button>
      </div>
      {confirmDeleteDisplay && (
        <ConfirmDeletePopUp
          setConfirmDeleteDisplay={setConfirmDeleteDisplay}
          projectId={project.projectId}
          deleteProject={deleteProject}
        />
      )}
    </div>
  );
};
