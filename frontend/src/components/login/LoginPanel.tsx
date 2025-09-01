"use client";

import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // UPDATED
import api from "@/lib/api";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

type View = "chooser" | "login" | "register";

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

type Attempts = { count: number; firstAt: number };
type Flash = { type: "success" | "error"; text: string } | null; // UPDATED

function isAttempts(x: unknown): x is Attempts {
  if (!x || typeof x !== "object") return false;
  const obj = x as Record<string, unknown>;
  return Number.isFinite(obj.count) && Number.isFinite(obj.firstAt);
}
function getAttempts(): Attempts | null {
  try {
    const raw = globalThis.localStorage?.getItem("loginAttempts");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isAttempts(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
function setAttempts(a: Attempts): void {
  globalThis.localStorage?.setItem("loginAttempts", JSON.stringify(a));
}
function clearAttempts(): void {
  globalThis.localStorage?.removeItem("loginAttempts");
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(pw: string): boolean {
  return /^(?=.*[A-Z])(?=.*[a-z])(?=.*[\W_]).{10,64}$/.test(pw);
}

export const LoginPanel = (): JSX.Element => {
  const router = useRouter();
  const searchParams = useSearchParams(); // UPDATED
  const [view, setView] = useState<View>("chooser");

  // ----- dynamic title per view -----
  const TITLES: Record<View, string> = {
    chooser: "Choose your login Option",
    login: "Login - Welcome Back",
    register: "Register - Welcome",
  };

  // Shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Eye toggles
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegisterPw, setShowRegisterPw] = useState(false);

  // Register fields reuse email/password
  const [regErrors, setRegErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  // Generic error message for login
  const [loginError, setLoginError] = useState<string | null>(null);

  // Attempt limiter state
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const intervalRef = useRef<number | null>(null);

  // Flash banner (success/error)
  const [flash, setFlash] = useState<Flash>(null); // UPDATED

  useEffect(() => {
    const a = getAttempts();
    if (!a) return;
    const windowEnd = a.firstAt + WINDOW_MS;
    if (a.count >= MAX_ATTEMPTS && windowEnd > Date.now())
      setLockedUntil(windowEnd);
    else if (windowEnd <= Date.now()) clearAttempts();
  }, []);

  useEffect(() => {
    if (!lockedUntil) return;
    intervalRef.current = globalThis.setInterval(
      () => setNow(Date.now()),
      1000,
    ) as unknown as number;
    return () => {
      if (intervalRef.current) globalThis.clearInterval(intervalRef.current);
    };
  }, [lockedUntil]);

  // UPDATED: react to ?msg= changes (no remount needed)
  useEffect(() => {
    const msg = searchParams.get("msg");
    if (msg === "register_ok") {
      setFlash({ type: "success", text: "Register Success Proceed to Login" });
      setView("login");
      // clean the URL but keep the flash in state
      router.replace("/login", { scroll: false });
    } else if (msg === "register_err") {
      setFlash({ type: "error", text: "Something went Wrong" });
      setView("login");
      router.replace("/login", { scroll: false });
    }
  }, [searchParams, router]); // UPDATED

  const lockedRemainingMs = useMemo(
    () => (!lockedUntil ? 0 : Math.max(lockedUntil - now, 0)),
    [lockedUntil, now],
  );
  const isLocked = lockedRemainingMs > 0;
  const lockMinutes = Math.floor(lockedRemainingMs / 60000);
  const lockSeconds = Math.floor((lockedRemainingMs % 60000) / 1000);

  function recordLoginFailure(): void {
    const a = getAttempts();
    const nowTs = Date.now();
    if (!a) {
      setAttempts({ count: 1, firstAt: nowTs });
      return;
    }
    const windowEnd = a.firstAt + WINDOW_MS;
    if (nowTs > windowEnd) {
      setAttempts({ count: 1, firstAt: nowTs });
      setLockedUntil(null);
      return;
    }
    const nextCount = a.count + 1;
    setAttempts({ count: nextCount, firstAt: a.firstAt });
    if (nextCount >= MAX_ATTEMPTS) setLockedUntil(windowEnd);
  }
  function recordLoginSuccess(): void {
    clearAttempts();
    setLockedUntil(null);
  }

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault();
    setLoginError(null);
    if (isLocked) return;
    try {
      setSubmitting(true);
      await api.post("/auth/login", { email, password });
      recordLoginSuccess();
      router.push("/projects");
    } catch {
      setLoginError("Something is wrong. Please check your credentials.");
      recordLoginFailure();
    } finally {
      setSubmitting(false);
    }
  }

  function validateRegisterFields(): boolean {
    const errs: { email?: string; password?: string } = {};
    if (!validateEmail(email))
      errs.email = "Please enter a valid email address.";
    if (!validatePassword(password)) {
      errs.password =
        "Minimum 10 characters, with uppercase, lowercase, and a special character.";
    }
    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault();
    setRegErrors({});
    if (!validateRegisterFields()) return;
    try {
      setSubmitting(true);
      await api.post("/auth/register", { email, password });
      // UPDATED: switch view immediately (no flicker)
      setView("login"); // UPDATED
      // UPDATED: go to /login with success flag
      router.replace("/login?msg=register_ok"); // UPDATED
      // Optionally: router.refresh(); // force a refetch/render if needed
    } catch {
      // UPDATED: ensure we land on login view with error
      setView("login"); // UPDATED
      router.replace("/login?msg=register_err"); // UPDATED
      // Optionally: router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  function startProvider(provider: "google" | "microsoft" | "linkedin"): void {
    globalThis.location.href = `http://localhost:4000/auth/${provider}`;
  }

  // ------- styling helpers -------
  const labelCls = "text-sm text-violet-50";
  const inputBase =
    "mt-1 w-full rounded-xl border-2 border-violet-500 px-3 py-2 outline-none bg-violet-100 text-gray-900 focus:ring-2 focus:ring-violet-400";
  const inputWithIcon = `${inputBase} pr-11`;
  const primaryBtnCls =
    "rounded-2xl bg-violet-400 text-gray-900 px-4 py-2 font-semibold border-2 border-violet-500 hover:bg-violet-100 disabled:opacity-50";
  const secondaryBtnCls =
    "rounded-2xl bg-gray-300 text-gray-900 px-4 py-2 font-semibold border-2 border-violet-500 hover:bg-gray-200 disabled:opacity-50";
  const ghostBtnCls =
    "w-full rounded-2xl bg-gray-300 border-2 border-violet-500 px-4 py-3 text-left hover:bg-gray-200";

  return (
    <div className="flex flex-col gap-4">
      {/* dynamic title */}
      <h1 className="text-2xl font-bold mb-2 text-violet-50">{TITLES[view]}</h1>

      {/* Flash banner */}
      {flash && (
        <div
          role="status"
          className={`rounded-md border p-3 text-sm ${
            flash.type === "success"
              ? "bg-green-700/30 border-green-400 text-green-200"
              : "bg-red-700/30 border-red-400 text-red-200"
          }`}
        >
          {flash.text}
        </div>
      )}

      {view === "chooser" && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setView("login")}
            className={ghostBtnCls}
          >
            Continue with email and password
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-violet-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-600 px-2 text-violet-200">or</span>
            </div>
          </div>

          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => startProvider("google")}
              className={ghostBtnCls}
            >
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => startProvider("microsoft")}
              className={ghostBtnCls}
            >
              Continue with Microsoft
            </button>
          </div>

          <p className="text-sm text-violet-100 pt-4">
            No account yet?{" "}
            <button
              type="button"
              onClick={() => setView("register")}
              className="text-violet-300 hover:underline"
            >
              Create one
            </button>
          </p>
        </div>
      )}

      {view === "login" && (
        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block">
            <span className={labelCls}>Email</span>
            <input
              type="email"
              autoComplete="email"
              className={inputBase}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </label>

          <label className="block">
            <span className={labelCls}>Password</span>
            <div className="relative">
              <input
                id="login-password"
                type={showLoginPw ? "text" : "password"}
                autoComplete="current-password"
                className={inputWithIcon}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
              />
              <button
                type="button"
                aria-label={showLoginPw ? "Hide password" : "Show password"}
                aria-controls="login-password"
                aria-pressed={showLoginPw}
                onClick={() => setShowLoginPw((s) => !s)}
                className="absolute inset-y-0 right-2 my-auto p-1 rounded-md hover:bg-violet-200/60"
                title={showLoginPw ? "Hide password" : "Show password"}
              >
                {showLoginPw ? (
                  <VisibilityOffRoundedIcon fontSize="small" />
                ) : (
                  <VisibilityRoundedIcon fontSize="small" />
                )}
              </button>
            </div>
          </label>

          {loginError && <p className="text-sm text-red-300">{loginError}</p>}

          {isLocked ? (
            <div className="rounded-md bg-gray-700 border border-yellow-400 p-3 text-sm text-yellow-300">
              Too many attempts. Try again in {lockMinutes}:
              {String(lockSeconds).padStart(2, "0")}.
            </div>
          ) : null}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting || isLocked}
              className={`${primaryBtnCls} flex-1`}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => setView("chooser")}
              className={secondaryBtnCls}
              disabled={submitting}
            >
              Back
            </button>
          </div>

          <p className="text-sm text-violet-100 pt-2">
            No account yet?{" "}
            <button
              type="button"
              onClick={() => setView("register")}
              className="text-violet-300 hover:underline"
            >
              Create one
            </button>
          </p>
        </form>
      )}

      {view === "register" && (
        <form onSubmit={handleRegister} className="space-y-4">
          <label className="block">
            <span className={labelCls}>Email</span>
            <input
              type="email"
              autoComplete="email"
              className={inputBase}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (regErrors.email)
                  setRegErrors((r) => ({ ...r, email: undefined }));
              }}
              disabled={submitting}
              required
            />
            {regErrors.email && (
              <p className="text-xs text-red-300 mt-1">{regErrors.email}</p>
            )}
          </label>

          <label className="block">
            <span className={labelCls}>Password</span>
            <div className="relative">
              <input
                id="register-password"
                type={showRegisterPw ? "text" : "password"}
                autoComplete="new-password"
                className={inputWithIcon}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (regErrors.password)
                    setRegErrors((r) => ({ ...r, password: undefined }));
                }}
                disabled={submitting}
                required
              />
              <button
                type="button"
                aria-label={showRegisterPw ? "Hide password" : "Show password"}
                aria-controls="register-password"
                aria-pressed={showRegisterPw}
                onClick={() => setShowRegisterPw((s) => !s)}
                className="absolute inset-y-0 right-2 my-auto p-1 rounded-md hover:bg-violet-200/60"
                title={showRegisterPw ? "Hide password" : "Show password"}
              >
                {showRegisterPw ? (
                  <VisibilityOffRoundedIcon fontSize="small" />
                ) : (
                  <VisibilityRoundedIcon fontSize="small" />
                )}
              </button>
            </div>
            <p className="text-xs text-violet-200 mt-1">
              Minimum 10 characters, with uppercase, lowercase, and a special
              character.
            </p>
            {regErrors.password && (
              <p className="text-xs text-red-300 mt-1">{regErrors.password}</p>
            )}
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className={`${primaryBtnCls} flex-1`}
            >
              {submitting ? "Creating…" : "Create account"}
            </button>
            <button
              type="button"
              onClick={() => setView("chooser")}
              className={secondaryBtnCls}
              disabled={submitting}
            >
              Back
            </button>
          </div>

          <p className="text-sm text-violet-100 pt-2">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setView("login")}
              className="text-violet-300 hover:underline"
            >
              Sign in
            </button>
          </p>
        </form>
      )}
    </div>
  );
};
