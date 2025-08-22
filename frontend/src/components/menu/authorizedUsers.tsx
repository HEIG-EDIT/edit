import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export const AuthorizedUsers = () => {
  // TODO : recuperer le nom des types d'utilisateurs (owner, editor et viewer) via appel au backend
  const userTypes = ["owner", "editor", "viewer"];

  // TODO : faire un appel au backend pour recuperer users pour chaque type
  const ownerUsers = ["moi"];
  const editorUsers = ["moi", "toi"];
  const viewerUsers = ["vous"];

  interface WIPProps {
    type: string;
    title: string;
    typedUsers: string[];
  }

  // TODO : clean construction du dict (et supprimer any)

  const WIP: Record<string, WIPProps> = {
    [userTypes[0]]: {
      type: userTypes[0],
      title: "Owner Users",
      typedUsers: ownerUsers,
    },
    [userTypes[1]]: {
      type: userTypes[1],
      title: "Editor Users",
      typedUsers: editorUsers,
    },
    [userTypes[2]]: {
      type: userTypes[2],
      title: "Viewer Users",
      typedUsers: viewerUsers,
    },
  };

  // TODO : finir de gerer logique et ui
  const DisplayUser = ({ username }: { username: string }) => {
    return (
      <div className="bg-violet-50 rounded-xl p-1 flex flex-row">
        <p>{username}</p>
        <CloseRoundedIcon />
      </div>
    );
  };

  return (
    <div className="flex flex-row justify-between gap-2">
      {Object.keys(WIP).map((key) => {
        return (
          <div key={WIP[key].type}>
            <p className="text-violet-50 text-center mb-4">{WIP[key].title}</p>
            {/* TODO : ajouter scroll sur ce bloc */}
            <div className="bg-gray-900 rounded-xl p-2">
              {WIP[key].typedUsers.map((u: string) => {
                return (
                  <div key={u} className="flex flex-col">
                    <DisplayUser username={u} />;
                  </div>
                );
              })}
              {/* TODO : ajouter logique et ui pour nouveau user */}
            </div>
          </div>
        );
      })}
    </div>
  );
};
