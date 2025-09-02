"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export const StartButton = () => {
  const router = useRouter();
  const [isUser, setIsUser] = useState<boolean | null>(null);

  // check user once on mount
  useEffect(() => {
    api
      .get("/user/me")
      .then((res) => {
        setIsUser(!!res.data?.id);
      })
      .catch(() => {
        setIsUser(false);
      });
  }, []);

  const handleClick = () => {
    if (isUser) {
      router.push("/projects");
    } else {
      router.push("/login");
    }
  };

  const label = isUser ? "Start Editing" : "Login / Register";

  return (
    <button
      type="button"
      className="bg-violet-500 hover:cursor-pointer hover:bg-violet-400  text-violet-50 text-xl font-extrabold rounded-full px-4 py-2 border-2 border-violet-50"
      onClick={handleClick}
    >
      {label}
    </button>
  );
};
