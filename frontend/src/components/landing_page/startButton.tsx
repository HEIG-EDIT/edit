"use client";

import { useRouter } from "next/navigation";

export const StartButton = () => {
  const router = useRouter();
  return (
    <button
      className="bg-violet-500 hover:cursor-pointer hover:bg-violet-300 hover:text-gray-800 text-violet-50 text-xl font-extrabold rounded-full px-4 py-2 border-3 hover:border-violet-500 border-violet-50"
      onClick={() => router.push("/")}
    >
      Start EDITing
    </button>
  );
};
