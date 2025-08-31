// Small helpers around your Axios client + status handling.
import api from "@/lib/api";
import type { AxiosError } from "axios";

export function isAxiosError(err: unknown): err is AxiosError {
  return (
    typeof err === "object" && err !== null && "isAxiosError" in (err as any)
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
      // Optional: quick visibility while debugging
      // console.log("logout error", status, err.response?.data);

      if (status === 404) return { ok: true, message: "Already logged out" };
      if (status === 401) return { ok: true, message: "No active session" };
      if (status === 400) {
        // Final attempt if cookie wasn't present initially
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
