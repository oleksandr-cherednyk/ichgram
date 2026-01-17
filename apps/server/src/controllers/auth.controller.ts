import { type Request, type Response } from 'express';

import { UserModel } from '../models';
import { loginUser, refreshSession, registerUser } from '../services';
import {
  clearRefreshCookie,
  getRefreshTokenFromCookies,
  setRefreshCookie,
} from '../utils';
import {
  type LoginInput,
  type RefreshInput,
  type RegisterInput,
} from '../validations';

export const register = async (
  request: Request<{}, {}, RegisterInput>,
  response: Response,
) => {
  const result = await registerUser(request.body);

  setRefreshCookie(response, result.refreshToken);

  response.status(201).json({
    user: result.user,
    accessToken: result.accessToken,
  });
};

export const login = async (
  request: Request<{}, {}, LoginInput>,
  response: Response,
) => {
  const result = await loginUser(request.body);

  setRefreshCookie(response, result.refreshToken);

  response.json({
    user: result.user,
    accessToken: result.accessToken,
  });
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
    throw {
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Refresh token missing',
    };
  }

  const result = await refreshSession(refreshToken);

  setRefreshCookie(response, result.refreshToken);

  response.json({ accessToken: result.accessToken });
};

export const me = async (request: Request, response: Response) => {
  if (!request.userId) {
    throw {
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    };
  }

  const user = await UserModel.findById(request.userId);
  if (!user) {
    throw {
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    };
  }

  response.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
    },
  });
};
