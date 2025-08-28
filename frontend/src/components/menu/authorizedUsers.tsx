import api from "@/lib/api";
import { Collaborator } from "@/models/api/collaborator/collaborator";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useEffect, useMemo, useState } from "react";
import { ErrorComponent } from "../api/errorComponent";
import { LoadingComponent } from "../api/loadingComponent";

export const AuthorizedUsers = ({
  projectId,
}: {
  projectId: number | undefined;
}) => {
  // TODO : recuperer le nom des roles via appel au backend ?
  const ROLES = ["owner", "editor", "viewer"];

  const [collaborators, setCollaborators] = useState<Collaborator[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO : utiliser authentification
        // TODO : tester endpoint
        const res = await api.get(`{/api/collaborations/${projectId}}`);
        setCollaborators(res.data);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // TODO : to remove
  /*
  let ownerCollaborators = new Set<Collaborator>();
  let editorCollaborators = new Set<Collaborator>();
  let viewerCollaborators = new Set<Collaborator>();

  const ownerUsers = [
    "moi",
    "tttttttttt",
    "sssssssssssssssss",
    "rrrrrrrrrsssssssssssssrrrrrrr",
  ];
  const editorUsers = [
    "moi",
    "toi",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "ssssssssssssrrrrrrrrsssss",
  ];
  const viewerUsers = ["vous", "sssrrrrrrrrrrrrrrrssssssssssssss"];*/

  // TODO : collaborations potentiellement vides, a tester...
  const USERS_BY_ROLE = useMemo(() => {
    if (!collaborators) return {};
    return ROLES.reduce(
      (acc, role) => {
        acc[role] = {
          type: role,
          title: role.charAt(0).toUpperCase() + role.slice(1) + " Users",
          collaborators: new Set(
            collaborators.filter((c) => c.roles.includes(role)) || [],
          ),
        };
        return acc;
      },
      {} as Record<
        string,
        { type: string; title: string; collaborators: Set<Collaborator> }
      >,
    );
  }, [collaborators]);

  // TODO : tester si nest down
  if (hasError) {
    return <ErrorComponent subject="collaborators" />;
  }

  // TODO : tester en ralentissant
  if (isLoading) {
    return <LoadingComponent />;
  }

  // TODO : finir de gerer logique et ui
  const DisplayUser = ({ userEmail }: { userEmail: string }) => {
    return (
      <div className="bg-violet-50 rounded-xl p-1 flex items-center justify-between">
        <p className="truncate whitespace-nowrap" title={userEmail}>
          {userEmail}
        </p>
        {/* TODO : gerer suppression de la collab */}
        <CloseRoundedIcon className="shrink-0 cursor-pointer" />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {Object.keys(USERS_BY_ROLE).map((key) => {
        return (
          <div
            key={USERS_BY_ROLE[key].type}
            className="flex flex-col gap-4 items-center"
          >
            <p className="text-violet-50">{USERS_BY_ROLE[key].title}</p>
            <div
              className="bg-gray-900 rounded-xl p-2 flex flex-col max-h-44 w-full overflow-y-auto
                         [&::-webkit-scrollbar]:w-2
                       [&::-webkit-scrollbar-track]:bg-gray-400
                         [&::-webkit-scrollbar-track]:rounded-xl
                       [&::-webkit-scrollbar-thumb]:bg-violet-400
                         [&::-webkit-scrollbar-thumb]:rounded-xl"
            >
              {Array.from(USERS_BY_ROLE[key].collaborators).map(
                (c: Collaborator) => {
                  return (
                    <div key={c.collaborationId} className="mb-2 last:mb-0">
                      <DisplayUser userEmail={c.userEmail} />
                    </div>
                  );
                },
              )}
              {/* TODO : ajouter logique et ui pour nouveau user */}
            </div>
          </div>
        );
      })}
    </div>
  );
};
