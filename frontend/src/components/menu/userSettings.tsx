"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import ModeEditOutlineRoundedIcon from "@mui/icons-material/ModeEditOutlineRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import { AxiosError } from "axios";

// ---- Types ----
type UserProfile = { id: number; userName: string; email: string };

type MsgKind = "success" | "error" | "info";
type Msg = { kind: MsgKind; text: string };

// ---- Validators (keep simple, FE-only) ----
const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const isValidUsername = (value: string) =>
  /^[a-zA-Z0-9._-]{3,24}$/.test(value.trim());

// ---- Small helper to map API errors to UI messages ----
function msgFromAxios(err: unknown): Msg {
  if (err instanceof AxiosError && err.response) {
    const { status } = err.response;
    if (status === 401)
      return { kind: "error", text: "Session expired. Please log in again." };
    if (status === 403)
      return { kind: "error", text: "Not allowed for this account type." };
    if (status === 409)
      return { kind: "error", text: "Already in use. Try another value." };
    if (status === 422)
      return { kind: "error", text: "Validation failed. Check your input." };
  }
  return { kind: "error", text: "Something went wrong. Please try again." };
}

export const UserSettings = () => {
  // ----- profile state -----
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [msg, setMsg] = useState<Msg | null>(null);

  // ----- username editing -----
  const [editingUsername, setEditingUsername] = useState(false);
  const [userNameInput, setUserNameInput] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);

  // ----- email editing -----
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // ----- password change -----
  const [changingPw, setChangingPw] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [repeatPw, setRepeatPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  // load profile
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      // GET /user/me returns { id, userName, email }
      const res = await api.get<UserProfile>("/user/me", {
        headers: { "Cache-Control": "no-store" },
      });
      setProfile(res.data);
      setUserNameInput(res.data.userName);
      setEmailInput(res.data.email);
    } catch (err) {
      setMsg(msgFromAxios(err));
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  // derived UI states
  const canSaveUsername = useMemo(
    () =>
      !savingUsername &&
      editingUsername &&
      isValidUsername(userNameInput) &&
      userNameInput.trim() !== (profile?.userName ?? ""),
    [editingUsername, savingUsername, userNameInput, profile?.userName],
  );

  const canSaveEmail = useMemo(
    () =>
      !savingEmail &&
      editingEmail &&
      isValidEmail(emailInput) &&
      emailInput.trim().toLowerCase() !== (profile?.email.toLowerCase() ?? ""),
    [editingEmail, savingEmail, emailInput, profile?.email],
  );

  const canSavePw = useMemo(
    () =>
      !savingPw &&
      changingPw &&
      newPw.length >= 10 &&
      newPw === repeatPw &&
      currentPw.length > 0,
    [savingPw, changingPw, newPw, repeatPw, currentPw],
  );

  // actions
  const startEditUsername = () => {
    setEditingUsername(true);
    setMsg(null);
  };
  const cancelEditUsername = () => {
    setUserNameInput(profile?.userName ?? "");
    setEditingUsername(false);
  };
  const startEditEmail = () => {
    setEditingEmail(true);
    setMsg(null);
  };
  const cancelEditEmail = () => {
    setEmailInput(profile?.email ?? "");
    setEditingEmail(false);
  };

  const saveUsername = async () => {
    if (!canSaveUsername) return;
    setSavingUsername(true);
    setMsg(null);
    try {
      // PATCH /user/me/username body: { userName: string }
      const res = await api.patch<{ userName: string }>("/user/me/username", {
        userName: userNameInput.trim(),
      });

      // Backend behavior:
      // 200 -> returns { userName }
      // 204 -> unchanged (no content)
      if (res.status === 200) {
        setProfile((p) => (p ? { ...p, userName: res.data.userName } : p));
        setMsg({ kind: "success", text: "Username updated." });
      } else if (res.status === 204) {
        setMsg({ kind: "info", text: "No change was necessary." });
      }
      setEditingUsername(false);
    } catch (err) {
      setMsg(msgFromAxios(err));
    } finally {
      setSavingUsername(false);
    }
  };

  const saveEmail = async () => {
    if (!canSaveEmail) return;
    setSavingEmail(true);
    setMsg(null);
    try {
      // PATCH /user/me/email body: { email: string }
      const res = await api.patch<{ message: string } | void>(
        "/user/me/email",
        {
          email: emailInput.trim(),
        },
      );

      // Backend behavior:
      // 200 -> { message: 'Address changed successfully.' }
      // 204 -> unchanged
      // 403 -> oauth-only account
      // 409 -> conflict
      if (res.status === 200) {
        setProfile((p) => (p ? { ...p, email: emailInput.trim() } : p));
        setMsg({ kind: "success", text: "Email updated." });
      } else if (res.status === 204) {
        setMsg({ kind: "info", text: "No change was necessary." });
      }
      setEditingEmail(false);
    } catch (err) {
      setMsg(msgFromAxios(err));
    } finally {
      setSavingEmail(false);
    }
  };

  const savePassword = async () => {
    if (!canSavePw) return;
    setSavingPw(true);
    setMsg(null);
    try {
      // POST /user/me/change-password
      const res = await api.post<{ message: string; twoFA: boolean }>(
        "/user/me/change-password",
        {
          currentPassword: currentPw,
          newPassword: newPw,
          repeatPassword: repeatPw,
        },
      );
      if (res.status === 200) {
        setMsg({ kind: "success", text: "Password changed successfully." });
        setChangingPw(false);
        setCurrentPw("");
        setNewPw("");
        setRepeatPw("");
      }
    } catch (err) {
      setMsg(msgFromAxios(err));
    } finally {
      setSavingPw(false);
    }
  };

  // UI helpers
  const Alert = ({ notice }: { notice: Msg }) => {
    const base =
      "rounded-md px-3 py-2 text-sm border " +
      (notice.kind === "success"
        ? "bg-green-50 border-green-200 text-green-800"
        : notice.kind === "error"
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-yellow-50 border-yellow-200 text-yellow-800");
    return <div className={base}>{notice.text}</div>;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-300">
        Loading…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-3">
        {msg && <Alert notice={msg} />}
        <p className="text-sm text-gray-200">
          Couldn’t load your profile. Please try again.
        </p>
        <button
          type="button"
          onClick={() => void loadProfile()}
          className="rounded-lg bg-violet-600 text-white px-4 py-2 font-semibold hover:bg-violet-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-2 space-y-4 text-gray-100">
      <h2 className="text-xl font-semibold mb-2">User Settings</h2>

      {msg && <Alert notice={msg} />}

      {/* Username row */}
      <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <PersonOutlineRoundedIcon />
          {!editingUsername ? (
            <>
              <div className="flex-1">
                <div className="text-sm text-gray-400">Username</div>
                <div className="text-lg font-medium">{profile.userName}</div>
              </div>
              <button
                type="button"
                onClick={startEditUsername}
                className="rounded-lg border border-gray-500 px-3 py-1 hover:bg-gray-700"
                aria-label="Edit username"
                title="Edit username"
              >
                <ModeEditOutlineRoundedIcon fontSize="small" />
              </button>
            </>
          ) : (
            <div className="flex-1 flex items-end gap-2">
              <label className="w-full">
                <span className="text-xs text-gray-400">New username</span>
                <input
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="your_name"
                />
              </label>
              <button
                type="button"
                onClick={saveUsername}
                disabled={!canSaveUsername}
                className="rounded-lg bg-violet-600 text-white px-3 py-2 hover:bg-violet-500 disabled:opacity-50"
                title="Save username"
              >
                <CheckRoundedIcon fontSize="small" />
              </button>
              <button
                type="button"
                onClick={cancelEditUsername}
                className="rounded-lg border border-gray-500 px-3 py-2 hover:bg-gray-700"
                title="Cancel"
              >
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>
          )}
        </div>
        {editingUsername && !isValidUsername(userNameInput) && (
          <p className="text-xs text-yellow-400 mt-2">
            3–24 chars, letters/numbers/dot/underscore/hyphen.
          </p>
        )}
      </div>

      {/* Email row */}
      <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <AlternateEmailRoundedIcon />
          {!editingEmail ? (
            <>
              <div className="flex-1">
                <div className="text-sm text-gray-400">Email</div>
                <div className="text-lg font-medium break-all">
                  {profile.email}
                </div>
              </div>
              <button
                type="button"
                onClick={startEditEmail}
                className="rounded-lg border border-gray-500 px-3 py-1 hover:bg-gray-700"
                aria-label="Edit email"
                title="Edit email"
              >
                <ModeEditOutlineRoundedIcon fontSize="small" />
              </button>
            </>
          ) : (
            <div className="flex-1 flex items-end gap-2">
              <label className="w-full">
                <span className="text-xs text-gray-400">New email</span>
                <input
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="you@example.com"
                />
              </label>
              <button
                type="button"
                onClick={saveEmail}
                disabled={!canSaveEmail}
                className="rounded-lg bg-violet-600 text-white px-3 py-2 hover:bg-violet-500 disabled:opacity-50"
                title="Save email"
              >
                <CheckRoundedIcon fontSize="small" />
              </button>
              <button
                type="button"
                onClick={cancelEditEmail}
                className="rounded-lg border border-gray-500 px-3 py-2 hover:bg-gray-700"
                title="Cancel"
              >
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>
          )}
        </div>
        {editingEmail && !isValidEmail(emailInput) && (
          <p className="text-xs text-yellow-400 mt-2">Enter a valid email.</p>
        )}
      </div>

      {/* Password change */}
      <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <LockResetRoundedIcon />
          <div className="text-lg font-medium">Password</div>
        </div>

        {!changingPw ? (
          <button
            type="button"
            onClick={() => {
              setChangingPw(true);
              setMsg(null);
            }}
            className="rounded-lg bg-violet-600 text-white px-4 py-2 font-semibold hover:bg-violet-500"
          >
            Change password
          </button>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col">
              <span className="text-xs text-gray-400">Current password</span>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-400"
                autoComplete="current-password"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-xs text-gray-400">New password</span>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-400"
                autoComplete="new-password"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-xs text-gray-400">Repeat new password</span>
              <input
                type="password"
                value={repeatPw}
                onChange={(e) => setRepeatPw(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-400"
                autoComplete="new-password"
              />
            </label>

            <div className="sm:col-span-3 flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={savePassword}
                disabled={!canSavePw}
                className="rounded-lg bg-violet-600 text-white px-4 py-2 font-semibold hover:bg-violet-500 disabled:opacity-50"
              >
                Save password
              </button>
              <button
                type="button"
                onClick={() => {
                  setChangingPw(false);
                  setCurrentPw("");
                  setNewPw("");
                  setRepeatPw("");
                }}
                className="rounded-lg border border-gray-500 px-4 py-2 hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>

            <p className="sm:col-span-3 text-xs text-gray-400">
              Password must be at least 10 characters. (Follow your actual
              policy if stricter.)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
