import { type Response } from 'express';

import { env } from '../config';

const REFRESH_COOKIE_NAME = 'refreshToken';

const getRefreshCookieOptions = () => {
  const isProduction = env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
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
  cookies: Record<string, unknown> | undefined,
): string | null => {
  const value = cookies?.[REFRESH_COOKIE_NAME];
  return typeof value === 'string' && value.length > 0 ? value : null;
};
