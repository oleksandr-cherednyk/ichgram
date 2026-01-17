import bcrypt from 'bcrypt';
import { z } from 'zod';

import { UserModel } from '../models';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils';
import { type loginSchema, type registerSchema } from '../validations';

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

type AuthResult = {
  user: {
    id: string;
    email: string;
    username: string;
  };
  accessToken: string;
  refreshToken: string;
};

type RefreshResult = {
  accessToken: string;
  refreshToken: string;
};

const SALT_ROUNDS = 10;

export const registerUser = async (
  input: RegisterInput,
): Promise<AuthResult> => {
  const existing = await UserModel.findOne({
    $or: [{ email: input.email }, { username: input.username }],
  });

  if (existing) {
    throw {
      status: 409,
      code: 'CONFLICT',
      message: 'Email or username already in use',
    };
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await UserModel.create({
    email: input.email,
    fullName: input.fullName,
    username: input.username,
    passwordHash,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    accessToken: signAccessToken(user.id),
    refreshToken: signRefreshToken(user.id),
  };
};

export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
  const user = await UserModel.findOne({ email: input.email });
  if (!user) {
    throw {
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Invalid credentials',
    };
  }

  const matches = await bcrypt.compare(input.password, user.passwordHash);
  if (!matches) {
    throw {
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Invalid credentials',
    };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    accessToken: signAccessToken(user.id),
    refreshToken: signRefreshToken(user.id),
  };
};

export const refreshSession = async (
  refreshToken: string,
): Promise<RefreshResult> => {
  const payload = verifyRefreshToken(refreshToken);
  const subject = payload.sub;

  if (typeof subject !== 'string' || !subject) {
    throw {
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Invalid refresh token',
    };
  }

  const user = await UserModel.findById(subject);
  if (!user) {
    throw {
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Invalid refresh token',
    };
  }

  return {
    accessToken: signAccessToken(user.id),
    refreshToken: signRefreshToken(user.id),
  };
};
