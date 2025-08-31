import { Response, Request } from 'express';
import * as process from 'node:process';

export const COOKIE_COMMON = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'prod',
  sameSite: 'lax' as const,
  path: '/',
};

export function setAuthCookies(
  res: Response,
  params: {
    accessToken: string;
    accessTtlSec: number;
    refreshToken: string;
    refreshTtlSec: number;
    deviceId: string;
  },
) {
  res.cookie('access_token', params.accessToken, {
    ...COOKIE_COMMON,
    maxAge: params.accessTtlSec * 1000,
  });
  res.cookie('refresh_token', params.refreshToken, {
    ...COOKIE_COMMON,
    maxAge: params.refreshTtlSec * 1000,
  });
  // device id is NOT httpOnly so the frontend may read & attach it as header if needed
  res.cookie('device_id', params.deviceId, {
    secure: process.env.NODE_ENV === 'prod',
    sameSite: 'lax',
    path: '/',
    maxAge: params.refreshTtlSec * 1000,
  });
}

export type AuthUserShape = { userId?: number; id?: number; auth_id?: number };

export function resolveUserId(user?: AuthUserShape) {
  return user?.userId ?? user?.id ?? user?.auth_id;
}
