// Small helpers around your Axios client + status handling.
import api from "@/lib/api";
import type { AxiosError } from "axios";

// Type guard for AxiosError
export function isAxiosError(err: unknown): err is AxiosError {
  return (
    typeof err === "object" &&
    err !== null &&
    "isAxiosError" in (err as Record<string, unknown>)
  );
}

// Simple cookie reader (client-side only)
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length < 2) return null;
  return decodeURIComponent(parts.pop()!.split(";").shift()!);
}

// Map common backend statuses to short UI-friendly messages.
export function statusMessage(status?: number): string {
  switch (status) {
    case 200:
    case 201:
    case 204:
      return "Success.";
    case 400:
      return "Bad request.";
    case 401:
      return "Authentication required.";
    case 403:
      return "You don’t have permission to do this.";
    case 404:
      return "Not found.";
    case 409:
      return "Conflict. Try a different value.";
    case 422:
      return "Validation failed.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return "Unexpected error.";
  }
}

/**
 * Logout current device.
 * - Always send x-device-id header (from cookie) to avoid 400.
 * - If backend returns 401/404, treat as success (already logged out / no session).
 */
export async function logoutCurrentDevice(): Promise<{
  ok: boolean;
  message: string;
}> {
  try {
    // Always include device id proactively
    const deviceId = getCookie("device_id") || "";
    await api.post(
      "/auth/logout",
      deviceId ? { deviceId } : undefined,
      deviceId ? { headers: { "x-device-id": deviceId } } : undefined,
    );
    return { ok: true, message: "Logged out successfully" };
  } catch (err) {
    if (isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 404) return { ok: true, message: "Already logged out" };
      if (status === 401) return { ok: true, message: "No active session" };
      if (status === 400) {
        const deviceId = getCookie("device_id");
        if (deviceId) {
          try {
            await api.post(
              "/auth/logout",
              { deviceId },
              { headers: { "x-device-id": deviceId } },
            );
            return { ok: true, message: "Logged out successfully" };
          } catch (err2) {
            if (isAxiosError(err2)) {
              const st = err2.response?.status;
              if (st === 404)
                return { ok: true, message: "Already logged out" };
              if (st === 401) return { ok: true, message: "No active session" };
            }
            throw err2;
          }
        }
      }
    }
    throw err;
  }
}

/**
 * Logout ALL devices.
 * - 200 → ok
 * - 401 → treat as ok (no active session)
 */
export async function logoutAllDevices(): Promise<{
  ok: boolean;
  message: string;
  revoked?: number;
}> {
  try {
    const res = await api.post("/auth/logout-all");
    return {
      ok: true,
      message: "Logged out from all devices",
      revoked: (res.data?.revoked as number) ?? undefined,
    };
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 401) {
      return { ok: true, message: "No active session" };
    }
    throw err;
  }
}
