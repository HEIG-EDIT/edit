import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export const AuthorizedUsers = () => {
  // TODO : recuperer le nom des types d'utilisateurs (owner, editor et viewer) via appel au backend
  const userTypes = ["owner", "editor", "viewer"];

  // TODO : faire un appel au backend pour recuperer users pour chaque type
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
  const viewerUsers = ["vous", "sssrrrrrrrrrrrrrrrssssssssssssss"];

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
      <div className="bg-violet-50 rounded-xl p-1 flex items-center justify-between">
        <p className="truncate whitespace-nowrap" title={username}>
          {username}
        </p>
        <CloseRoundedIcon className="shrink-0 cursor-pointer" />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {Object.keys(WIP).map((key) => {
        return (
          <div key={WIP[key].type} className="flex flex-col gap-4 items-center">
            <p className="text-violet-50">{WIP[key].title}</p>
            <div
              className="bg-gray-900 rounded-xl p-2 flex flex-col max-h-44 w-full overflow-y-auto
                         [&::-webkit-scrollbar]:w-2
                       [&::-webkit-scrollbar-track]:bg-gray-400
                         [&::-webkit-scrollbar-track]:rounded-xl
                       [&::-webkit-scrollbar-thumb]:bg-violet-400
                         [&::-webkit-scrollbar-thumb]:rounded-xl"
            >
              {WIP[key].typedUsers.map((u: string) => {
                return (
                  // TODO : username pas unique, a voir comment gerer
                  <div key={u} className="mb-2 last:mb-0">
                    <DisplayUser username={u} />
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
