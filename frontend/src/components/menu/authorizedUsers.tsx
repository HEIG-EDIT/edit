import api from "@/lib/api";
import { Collaborator } from "@/models/api/collaborator/collaborator";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useEffect, useMemo, useState } from "react";
import { ErrorComponent } from "../api/errorComponent";
import { LoadingComponent } from "../api/loadingComponent";

export const AuthorizedUsers = ({ projectId }: { projectId: number }) => {
  const ROLES = ["owner", "editor", "viewer"];

  const [collaborators, setCollaborators] = useState<Collaborator[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const getCollaborations = async () => {
    try {
      const res = await api.get(`/collaborations/${projectId}`);
      setCollaborators(res.data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    getCollaborations();
  }, [projectId]);

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
    const [hasError, setHasError] = useState<boolean>(false);

    const removeCollaboration = async () => {
      try {
        await api.delete(`/collaborations/${collaborationId}`);
        setCollaborators((prev) =>
          prev
            ? prev.filter((c) => c.collaborationId !== collaborationId)
            : prev,
        );
        setHasError(false);
      } catch {
        setHasError(true);
        setTimeout(() => setHasError(false), 3000);
      }
    };

    return (
      <div
        className={`bg-violet-50 rounded-xl p-1 flex items-center justify-between ${hasError ? "border border-red-600" : ""}`}
      >
        <p className="truncate whitespace-nowrap" title={userEmail}>
          {userEmail}
        </p>
        <button onClick={() => removeCollaboration()}>
          <CloseRoundedIcon className="shrink-0 cursor-pointer" />
        </button>
      </div>
    );
  };

  const DisplayNewUser = ({
    projectId,
    role,
  }: {
    projectId: number;
    role: string;
  }) => {
    const [email, setEmail] = useState<string>("");
    const [hasError, setHasError] = useState<boolean>(false);

    const addCollaboration = async () => {
      try {
        await api.post("/collaborations", {
          userEmail: email,
          projectId: projectId,
          roles: [role], // array required to comply with the database schema
        });
        setHasError(false);
        getCollaborations();
      } catch {
        setHasError(true);
        setTimeout(() => setHasError(false), 3000);
        setEmail("");
      }
    };

    return (
      <div
        className={`bg-violet-50 rounded-xl p-1 flex items-center justify-between ${hasError ? "border border-red-600" : ""}`}
      >
        <input
          className="truncate whitespace-nowrap min-w-0"
          type="text"
          placeholder="New collab. email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={() => {
            addCollaboration();
          }}
        >
          <AddRoundedIcon className="shrink-0 cursor-pointer" />
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
                <DisplayNewUser
                  projectId={projectId}
                  role={USERS_BY_ROLE[key].type}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
