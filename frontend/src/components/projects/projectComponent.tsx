"use client";

import { Project } from "@/models/api/project/project";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import Link from "next/link";
import colors from "tailwindcss/colors";

// TODO : taille du composant a adapter selon taille de la thumbnail

export const ProjectComponent = ({ project }: { project: Project }) => {
  const lastModifiedDate = project.lastSavedAt
    ? format(new Date(project.lastSavedAt), "dd.MM.yy 'at' HH:mm", {
        locale: enUS,
      })
    : "-";

  return (
    <div className="w-[160px] h-[160px] rounded-2xl bg-gray-600 border-2 border-violet-400 flex flex-col overflow-hidden">
      <Link
        // TODO : gerer redirection sur projet (/editor/projectId)
        href="/editor"
        className="w-[160px] h-[90px] overflow-hidden cursor-pointer"
      >
        <img
          src={`data:image/png;base64,${project.thumbnail}`}
          width={160}
          height={90}
          className="object-cover w-full h-full"
        />
      </Link>
      <div className="border-2 border-violet-300"></div>
      <div className="h-[70px] flex flex-row items-center px-2">
        <div className="flex flex-col flex-1 min-w-0 items-start justify-center">
          {/* TODO : s'occuper de pouvoir renommer le projet ici */}
          <p
            className="truncate font-bold text-violet-50 text-sm text-left w-full"
            title={project.projectName}
          >
            {project.projectName}
          </p>
          <p className="text-sm text-violet-400 text-left w-full cursor-default">
            {lastModifiedDate}
          </p>
        </div>
        {/* TODO : gerer logique pour supprimer projet + pop up de confirmation*/}
        <button className="flex-shrink-0 cursor-pointer" onClick={() => {}}>
          <DeleteRoundedIcon style={{ color: colors.violet[300] }} />
        </button>
      </div>
    </div>
  );
};
