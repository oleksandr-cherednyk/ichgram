import { type Request, type Response } from 'express';

import { env } from '../config';

const REFRESH_COOKIE_NAME = 'refreshToken';

const getRefreshCookieOptions = () => {
  return {
    httpOnly: true,
    sameSite: env.COOKIE_SECURE ? 'none' : 'lax',
    secure: env.COOKIE_SECURE,
    path: '/',
  } as const;
};

export const setRefreshCookie = (response: Response, token: string): void => {
  response.cookie(REFRESH_COOKIE_NAME, token, getRefreshCookieOptions());
};

export const clearRefreshCookie = (response: Response): void => {
  response.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
};

export const getRefreshTokenFromCookies = (
  cookies: Request['cookies'] | undefined,
): string | null => {
  const value = cookies?.[REFRESH_COOKIE_NAME];
  return typeof value === 'string' && value.length > 0 ? value : null;
};
