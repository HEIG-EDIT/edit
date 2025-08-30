import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import Link from "next/link";
import colors from "tailwindcss/colors";
import { useState } from "react";
import api from "@/lib/api";
import { ConfirmDeletePopUp } from "./confirmDeletePopUp";
import { ProjectProps } from "@/models/projects/projectProps";

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

  const saveProjectName = async (projectId: number, newProjectName: string) => {
    if (!newProjectName || newProjectName === project.projectName) {
      setCurrentProjectName(project.projectName);
      return;
    }
    try {
      await api.patch("/api/projects/rename", {
        id: projectId,
        name: newProjectName,
      });
      updateProjectName(projectId, newProjectName);
    } catch {
      setCurrentProjectName(project.projectName);
    } finally {
      setIsProjectNameEditing(false);
    }
  };

  return (
    <div className="w-[160px] h-[160px] rounded-2xl bg-gray-600 border-2 border-violet-400 flex flex-col overflow-hidden">
      <Link
        href={`/editor/${project.projectId}`}
        className="w-[160px] h-[90px] overflow-hidden cursor-pointer"
      >
        <img
          src={project.thumbnail}
          width={160}
          height={90}
          className="object-cover w-full h-full"
        />
      </Link>
      <div className="border-2 border-violet-300"></div>
      <div className="h-[70px] flex flex-row items-center px-2">
        <div className="flex flex-col flex-1 min-w-0 items-start justify-center">
          {isProjectNameEditing ? (
            <input
              className="font-bold text-violet-50 text-sm text-left w-full"
              value={currentProjectName}
              autoFocus
              onChange={(e) => setCurrentProjectName(e.target.value)}
              onBlur={() =>
                saveProjectName(project.projectId, currentProjectName)
              }
            />
          ) : (
            <p
              className="font-bold text-violet-50 text-sm text-left truncate w-full"
              title={project.projectName}
              contentEditable
              suppressContentEditableWarning
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
