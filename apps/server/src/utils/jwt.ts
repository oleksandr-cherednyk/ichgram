import jwt, { type JwtPayload } from 'jsonwebtoken';

import { env } from '../config';

type TokenPayload = {
  sub: string;
};

export const signAccessToken = (userId: string): string =>
  jwt.sign({ sub: userId } satisfies TokenPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
  });

export const signRefreshToken = (userId: string): string =>
  jwt.sign({ sub: userId } satisfies TokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL,
  });

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
