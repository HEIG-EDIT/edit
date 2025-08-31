"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { isAxiosError } from "@/lib/auth.tools";

/**
 * For protected pages:
 * - `checking`: true while verifying the session
 * - `allowed`: true once confirmed; false when redirecting to /login
 */
export function useRequireAuthState(): { checking: boolean; allowed: boolean } {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get("/user/me", {
          headers: { "Cache-Control": "no-store" },
        });
        if (!cancelled && res.status === 200) {
          setAllowed(true);
        }
      } catch (err) {
        // 401 → not logged in → redirect
        if (isAxiosError(err) && err.response?.status === 401) {
          router.replace("/login");
        } else {
          // any other issue: still send to login to be safe
          router.replace("/login");
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return { checking, allowed };
}

/** Guest-only (login) hook – now returns `checking` (true while verifying). */
export function useRedirectIfAuthed(): boolean {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/user/me", {
          headers: { "Cache-Control": "no-store" },
        });
        if (!cancelled && res.status === 200) {
          router.replace("/projects");
          return;
        }
      } catch {
        // 401 or network → stay on login
      }
      if (!cancelled) setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return checking;
}
