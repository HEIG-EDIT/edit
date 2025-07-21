"use client";

import { useRouter } from "next/navigation";

export const StartButton = () => {
  const router = useRouter();
  return (
    <button
      className="bg-violet-500 hover:bg-violet-300 text-violet-50 font-bold rounded-full px-4 py-2 border-2 border-violet-50"
      onClick={() => router.push("/")}
    >
      Start EDITing
    </button>
  );
};
