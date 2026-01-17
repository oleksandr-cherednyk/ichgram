import { type Request, type Response } from 'express';

import { UserModel } from '../models';
import { loginUser, refreshSession, registerUser } from '../services';
import {
  clearRefreshCookie,
  createApiError,
  getRefreshTokenFromCookies,
  setRefreshCookie,
} from '../utils';
import {
  type LoginInput,
  type RefreshInput,
  type RegisterInput,
} from '../validations';

type UserDoc = NonNullable<Awaited<ReturnType<typeof UserModel.findById>>>;

const getUserResponse = (user: UserDoc) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  fullName: user.fullName,
  avatarUrl: user.avatarUrl ?? null,
});

const sendAuthResponse = (
  response: Response,
  result: { user: ReturnType<typeof getUserResponse>; accessToken: string },
  status: number,
) => {
  response.status(status).json({
    user: result.user,
    accessToken: result.accessToken,
  });
};

export const register = async (
  request: Request<{}, {}, RegisterInput>,
  response: Response,
) => {
  const result = await registerUser(request.body);

  setRefreshCookie(response, result.refreshToken);

  sendAuthResponse(response, result, 201);
};

export const login = async (
  request: Request<{}, {}, LoginInput>,
  response: Response,
) => {
  const result = await loginUser(request.body);

  setRefreshCookie(response, result.refreshToken);

  sendAuthResponse(response, result, 200);
};

export const logout = async (_request: Request, response: Response) => {
  clearRefreshCookie(response);
  response.json({ ok: true });
};

export const refresh = async (
  request: Request<{}, {}, RefreshInput>,
  response: Response,
) => {
  const refreshToken = getRefreshTokenFromCookies(request.cookies);

  if (!refreshToken) {
    throw createApiError(401, 'UNAUTHORIZED', 'Refresh token missing');
  }

  const result = await refreshSession(refreshToken);

  setRefreshCookie(response, result.refreshToken);

  response.json({ accessToken: result.accessToken });
};

export const me = async (request: Request, response: Response) => {
  if (!request.userId) {
    throw createApiError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const user = await UserModel.findById(request.userId);
  if (!user) {
    throw createApiError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  response.json({
    user: getUserResponse(user),
  });
};
