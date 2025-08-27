import { usePathname } from "next/navigation";
import { useState } from "react";
import { AuthorizedUsers } from "./authorizedUsers";
import { EntryButton } from "./entryButton";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";

export const ProjectCollaboration = () => {
  const currentPage = usePathname().split("/")[1];

  // TODO : recuperer id + nom + thumbnail des projets via appel au backend et creer un record pour stocker tout ca
  const projectsName = ["tata", "toto", "tutu"];
  const [currentProjectName, setCurrentProjectName] = useState<string>(
    projectsName[0],
  );

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
              className="bg-violet-500 text-violet-50 rounded p-2 cursor-pointer"
              value={currentProjectName}
              onChange={(e) => {
                setCurrentProjectName(e.target.value);
              }}
            >
              {projectsName.map((name) => (
                // TODO : utiliser comme cle id du projet car unicite
                <option key={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>THUMBNAIL</div>
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
