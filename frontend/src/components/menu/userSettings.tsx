import api from "@/lib/api";
import { User } from "@/models/api/user/user";
import { useEffect, useState } from "react";
import { ErrorComponent } from "../api/errorComponent";
import { LoadingComponent } from "../api/loadingComponent";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

// TODO : finalise composant une fois que ok cote Elbu

export const UserSettings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const fakeUser = {
    userName: "saskya",
    email: "saskya.panchaud@heig-vd.ch",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/user/me");
        setUser(res.data);
      } catch {
        // TODO : voir avec Elbu
        setUser(fakeUser);
        console.log(setHasError);
        //setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (hasError) {
    return <ErrorComponent subject="user" />;
  }

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <div className="flex flex-col justify-between gap-4">
      <div className="mb-2">
        <p className="text-violet-50 font-bold text-xl">User settings</p>
      </div>
      <div className="bg-gray-700 rounded-xl p-4 flex flex-col gap-6">
        <div className="flex flex-row items-center gap-2">
          <p className="text-violet-50">Username :</p>
          <div className="bg-violet-50 rounded-xl p-1 flex flex-row gap-2">
            <p>{user?.userName} </p>
            <EditRoundedIcon className="cursor-pointer" />
          </div>
        </div>
        {/* TODO : creer composant pour style */}
        <p className="text-violet-50">Email : {user?.email}</p>
      </div>
    </div>
  );
};
