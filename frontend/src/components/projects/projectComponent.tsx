"use client";

import { Project } from "@/models/api/project/project";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useRouter } from "next/navigation";

// TODO : taille du composant a adapter selon taille de la thumbnail

export const ProjectComponent = ({ project }: { project: Project }) => {
  const router = useRouter();

  return (
    // TODO : gerer redirection sur projet (/editor/projectId)
    <button onClick={() => router.push("/editor")} className="cursor-pointer">
      <div className="w-[160px] h-[160px] rounded-2xl bg-gray-600 border-2 border-violet-400 flex flex-col overflow-hidden">
        <div className="w-[160px] h-[90px] overflow-hidden">
          <img
            src={`data:image/png;base64,${project.thumbnail}`}
            width={160}
            height={90}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="p-2 flex flex-col justify-center h-[70px]">
          <p
            className="truncate font-bold text-violet-50 text-sm"
            title={project.projectName}
          >
            {project.projectName}
          </p>
          <p className="text-sm text-violet-400">
            {project.lastSavedAt
              ? format(
                  new Date(project.lastSavedAt),
                  "dd MMM yyyy 'at' HH:mm",
                  {
                    locale: enUS,
                  },
                )
              : "-"}
          </p>
        </div>
      </div>
    </button>
  );
};
