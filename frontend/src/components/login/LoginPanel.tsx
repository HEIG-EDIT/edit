"use client";

import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { AxiosError } from "axios"; // UPDATED: to parse backend statuses

type View = "chooser" | "login" | "register";

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

type Attempts = { count: number; firstAt: number };
type Flash = { type: "success" | "error"; text: string } | null;

// ---------- helpers: attempts ----------
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

// ---------- helpers: validation ----------
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Register password policy (matches your DTO): 10–64, upper+lower+symbol
function validateRegisterPassword(pw: string): boolean {
  return /^(?=.*[A-Z])(?=.*[a-z])(?=.*[\W_]).{10,64}$/.test(pw);
}

// UPDATED: Login password check matches your LoginDto (MinLength 14)
function validateLoginPassword(pw: string): boolean {
  return typeof pw === "string" && pw.length >= 14;
}

// UPDATED: normalize axios error payloads into {status, message}
function parseAxiosError(err: unknown): { status?: number; message: string } {
  const ax = err as AxiosError<any>;
  const status = ax?.response?.status;
  const data = ax?.response?.data;

  let message = "Something went wrong.";
  if (data?.message) {
    if (Array.isArray(data.message)) message = data.message.join(", ");
    else if (typeof data.message === "string") message = data.message;
  } else if (typeof data === "string") {
    message = data;
  } else if (ax?.message) {
    message = ax.message;
  }

  return { status, message };
}

export const LoginPanel = (): JSX.Element => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>("chooser");

  // dynamic title
  const TITLES: Record<View, string> = {
    chooser: "Choose your login Option",
    login: "Login - Welcome Back",
    register: "Register - Welcome",
  };

  // shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // visibility toggles
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegisterPw, setShowRegisterPw] = useState(false);

  // UPDATED: dedicated error states for each form
  const [loginErrors, setLoginErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [regErrors, setRegErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [submitting, setSubmitting] = useState(false);

  // Generic error for login (backend-driven)
  const [loginError, setLoginError] = useState<string | null>(null);

  // attempt limiter
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const intervalRef = useRef<number | null>(null);

  // flash banner
  const [flash, setFlash] = useState<Flash>(null);

  // UPDATED: force-remount nonces to ensure blank inputs after register success (discourage autofill from our state)
  const [formNonce, setFormNonce] = useState(0);

  // init attempts
  useEffect(() => {
    const a = getAttempts();
    if (!a) return;
    const windowEnd = a.firstAt + WINDOW_MS;
    if (a.count >= MAX_ATTEMPTS && windowEnd > Date.now())
      setLockedUntil(windowEnd);
    else if (windowEnd <= Date.now()) clearAttempts();
  }, []);

  // ticker for countdown
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

  // UPDATED: react only to ?msg=register_ok (success) — failures stay on the register form with field/global errors
  useEffect(() => {
    const msg = searchParams.get("msg");
    if (msg === "register_ok") {
      setFlash({ type: "success", text: "Register succeed, proceed to login" });
      setView("login");

      // wipe fields and remount login form to avoid any state-based autofill
      setEmail("");
      setPassword("");
      setShowLoginPw(false);
      setShowRegisterPw(false);
      setLoginErrors({});
      setRegErrors({});
      setFormNonce((n) => n + 1);

      // clean URL but keep flash in state
      router.replace("/login", { scroll: false });
    }
  }, [searchParams, router]);

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

  // ---------- LOGIN ----------
  // UPDATED: FE validation for login (email + min length 14)
  function validateLoginFields(): boolean {
    const errs: { email?: string; password?: string } = {};
    if (!validateEmail(email))
      errs.email = "Please enter a valid email address.";
    if (!validateLoginPassword(password))
      errs.password = "Password must be at least 14 characters.";
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault();
    setLoginError(null);
    setFlash(null);
    if (isLocked) return;

    // UPDATED: FE guard
    if (!validateLoginFields()) return;

    try {
      setSubmitting(true);
      const resp = await api.post("/auth/login", { email, password });
      // if backend returns 200 OK, proceed
      if (resp?.status === 200) {
        recordLoginSuccess();
        router.push("/projects");
      } else {
        // unexpected but safe fallback
        setLoginError("Unexpected response. Please try again.");
      }
    } catch (err) {
      const { status, message } = parseAxiosError(err);

      // UPDATED: map common statuses
      if (status === 401) {
        setLoginError("Invalid email or password.");
        recordLoginFailure(); // only count auth failures
      } else if (status === 400 || status === 422) {
        setLoginError(message || "Invalid input.");
        // do not increase limiter for validation errors
      } else if (status === 429) {
        setLoginError("Too many requests. Please wait a moment and try again.");
        recordLoginFailure();
      } else if (typeof status === "number") {
        setLoginError(`Login failed (HTTP ${status}). ${message}`);
        recordLoginFailure();
      } else {
        setLoginError("Network or server error. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- REGISTER ----------
  function validateRegisterFields(): boolean {
    const errs: { email?: string; password?: string } = {};
    if (!validateEmail(email))
      errs.email = "Please enter a valid email address.";
    if (!validateRegisterPassword(password)) {
      errs.password =
        "Minimum 10 characters with uppercase, lowercase, and a special character.";
    }
    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault();
    setFlash(null); // UPDATED: clear any banner
    setRegErrors({});

    if (!validateRegisterFields()) return;

    try {
      setSubmitting(true);
      const resp = await api.post("/auth/register", { email, password });
      // if backend returns 201 Created (or 200 OK from your helper), redirect to login with success flash
      if (resp?.status === 201 || resp?.status === 200) {
        // UPDATED: redirect with success flag
        setView("login");
        router.replace("/login?msg=register_ok");
      } else {
        setFlash({ type: "error", text: "Unexpected response from server." });
      }
    } catch (err) {
      // UPDATED: stay on register view, show backend validation/conflict/etc.
      const { status, message } = parseAxiosError(err);
      if (status === 409) {
        setFlash({
          type: "error",
          text: "An account with this email already exists.",
        });
      } else if (status === 400 || status === 422) {
        setFlash({ type: "error", text: message || "Invalid input." });
      } else if (typeof status === "number") {
        setFlash({
          type: "error",
          text: `Registration failed (HTTP ${status}). ${message}`,
        });
      } else {
        setFlash({
          type: "error",
          text: "Network or server error. Please try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function startProvider(provider: "google" | "microsoft" | "linkedin"): void {
    globalThis.location.href = `http://localhost:4000/auth/${provider}`;
  }

  // ------- styling -------
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
            {/*<button
              type="button"
              onClick={() => startProvider("linkedin")}
              className={ghostBtnCls}
            >
              Continue with LinkedIn
            </button>*/}
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
        <form
          key={`login-${formNonce}`}
          onSubmit={handleLogin}
          className="space-y-4"
          autoComplete="on"
        >
          <label className="block">
            <span className={labelCls}>Email</span>
            <input
              type="email"
              autoComplete="username" // UPDATED
              className={inputBase}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (loginErrors.email)
                  setLoginErrors((r) => ({ ...r, email: undefined }));
              }}
              disabled={submitting}
              required
            />
            {/* UPDATED: field error */}
            {loginErrors.email && (
              <p className="text-xs text-red-300 mt-1">{loginErrors.email}</p>
            )}
          </label>

          <label className="block">
            <span className={labelCls}>Password</span>
            <div className="relative">
              <input
                id="login-password"
                type={showLoginPw ? "text" : "password"}
                autoComplete="current-password" // UPDATED
                className={inputWithIcon}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (loginErrors.password)
                    setLoginErrors((r) => ({ ...r, password: undefined }));
                }}
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
            {/* UPDATED: field error */}
            {loginErrors.password && (
              <p className="text-xs text-red-300 mt-1">
                {loginErrors.password}
              </p>
            )}
          </label>

          {/* backend-driven error */}
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
              onClick={() => {
                setView("chooser");
                setLoginErrors({}); // UPDATED: clean errors on back
                setLoginError(null);
              }}
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
        <form
          onSubmit={handleRegister}
          className="space-y-4"
          autoComplete="off"
        >
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
              onClick={() => {
                setView("chooser");
                setRegErrors({}); // UPDATED: clean errors on back
              }}
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
