import jwt, {
  type JwtPayload,
  type Secret,
  type SignOptions,
} from 'jsonwebtoken';

import { env } from '../config';

type TokenPayload = {
  sub: string;
};

export const signAccessToken = (userId: string): string => {
  const payload: TokenPayload = { sub: userId };
  return jwt.sign(
    payload,
    env.JWT_ACCESS_SECRET as Secret,
    {
      expiresIn: env.ACCESS_TOKEN_TTL,
    } as SignOptions,
  );
};

export const signRefreshToken = (userId: string): string => {
  const payload: TokenPayload = { sub: userId };
  return jwt.sign(
    payload,
    env.JWT_REFRESH_SECRET as Secret,
    {
      expiresIn: env.REFRESH_TOKEN_TTL,
    } as SignOptions,
  );
};

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
