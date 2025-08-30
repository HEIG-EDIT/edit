import { Response, Request } from 'express';

export const COOKIE_COMMON = {
  httpOnly: true,
  //secure: IS_PROD,
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
    //secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: params.refreshTtlSec * 1000,
  });
}
