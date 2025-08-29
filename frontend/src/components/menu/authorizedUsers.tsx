import api from "@/lib/api";
import { Collaborator } from "@/models/api/collaborator/collaborator";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useEffect, useMemo, useState } from "react";
import { ErrorComponent } from "../api/errorComponent";
import { LoadingComponent } from "../api/loadingComponent";

// TODO : checker que user connecte ne peut pas s'enlever lui-meme le droit owner
export const AuthorizedUsers = ({
  projectId,
}: {
  projectId: number | undefined;
}) => {
  const ROLES = ["owner", "editor", "viewer"];

  const [collaborators, setCollaborators] = useState<Collaborator[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      try {
        const res = await api.get(`/api/collaborations/${projectId}`);
        setCollaborators(res.data);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const removeCollaboration = async (collaborationId: number) => {
    try {
      await api.delete(`/api/collaborations/${collaborationId}`);
      setCollaborators((prev) =>
        prev ? prev.filter((c) => c.collaborationId !== collaborationId) : prev,
      );
    } catch {
      // TODO : comment gerer au niveau affichage si erreur (pour le moment si erreur alors rien ne change) ?
    }
  };

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

  if (hasError) {
    return <ErrorComponent subject="collaborators" />;
  }

  if (isLoading) {
    return <LoadingComponent />;
  }

  const DisplayUser = ({
    collaborationId,
    userEmail,
  }: {
    userEmail: string;
    collaborationId: number;
  }) => {
    return (
      <div className="bg-violet-50 rounded-xl p-1 flex items-center justify-between">
        <p className="truncate whitespace-nowrap" title={userEmail}>
          {userEmail}
        </p>
        <button onClick={() => removeCollaboration(collaborationId)}>
          <CloseRoundedIcon className="shrink-0 cursor-pointer" />
        </button>
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
            {USERS_BY_ROLE[key].collaborators.size > 0 && (
              <div
                className="bg-gray-900 rounded-xl p-2 flex flex-col max-h-44 w-full overflow-y-auto
                         [&::-webkit-scrollbar]:w-2
                       [&::-webkit-scrollbar-track]:bg-gray-400
                         [&::-webkit-scrollbar-track]:rounded-xl
                       [&::-webkit-scrollbar-thumb]:bg-violet-400
                         [&::-webkit-scrollbar-thumb]:rounded-xl"
              >
                <div>
                  {Array.from(USERS_BY_ROLE[key].collaborators).map(
                    (c: Collaborator) => {
                      return (
                        <div key={c.collaborationId} className="mb-2 last:mb-0">
                          <DisplayUser
                            collaborationId={c.collaborationId}
                            userEmail={c.userEmail}
                          />
                        </div>
                      );
                    },
                  )}
                  {/* TODO : ajouter logique et ui pour nouveau user */}
                  <div className="bg-violet-50 rounded-xl p-1 flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="New collab. email"
                      className="truncate whitespace-nowrap min-w-0"
                    ></input>
                    <button onClick={() => {}}>
                      <AddRoundedIcon className="shrink-0 cursor-pointer" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
