"use client";

import { useRouter } from "next/navigation";

export const StartButton = () => {
  const router = useRouter();
  return (
    <button
      className="bg-violet-500 hover:cursor-pointer hover:bg-violet-400  text-violet-50 text-xl font-extrabold rounded-full px-4 py-2 border-3 border-violet-50 cursor-pointer"
      // TODO : @Elbu -> gerer redirect selon credentials ici ?
      onClick={() => router.push("/projects")}
    >
      Start EDITing
    </button>
  );
};
