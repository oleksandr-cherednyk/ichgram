import bcrypt from 'bcrypt';

import { UserModel } from '../models';
import {
  createApiError,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils';
import { type LoginInput, type RegisterInput } from '../validations';

type AuthResult = {
  user: {
    id: string;
    email: string;
    fullName: string;
    username: string;
    avatarUrl: string | null;
  };
  accessToken: string;
  refreshToken: string;
};

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

type RefreshResult = {
  accessToken: string;
  refreshToken: string;
};

const SALT_ROUNDS = 10;

const buildTokenPair = (userId: string): TokenPair => ({
  accessToken: signAccessToken(userId),
  refreshToken: signRefreshToken(userId),
});

type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
};

const buildAuthResult = (user: AuthUser): AuthResult => ({
  user: {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    avatarUrl: user.avatarUrl ?? null,
  },
  ...buildTokenPair(user.id),
});

export const registerUser = async (
  input: RegisterInput,
): Promise<AuthResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await UserModel.findOne({
    $or: [{ email: normalizedEmail }, { username: input.username }],
  });

  if (existing) {
    throw createApiError(409, 'CONFLICT', 'Email or username already in use');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await UserModel.create({
    email: normalizedEmail,
    fullName: input.fullName,
    username: input.username,
    passwordHash,
  });

  return buildAuthResult(user);
};

export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();
  const user = await UserModel.findOne({ email: normalizedEmail });
  if (!user) {
    throw createApiError(401, 'UNAUTHORIZED', 'Invalid credentials');
  }

  const matches = await bcrypt.compare(input.password, user.passwordHash);
  if (!matches) {
    throw createApiError(401, 'UNAUTHORIZED', 'Invalid credentials');
  }

  return buildAuthResult(user);
};

export const refreshSession = async (
  refreshToken: string,
): Promise<RefreshResult> => {
  let subject: string | null = null;

  try {
    const payload = verifyRefreshToken(refreshToken);
    subject = typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    subject = null;
  }

  if (!subject) {
    throw createApiError(401, 'UNAUTHORIZED', 'Invalid refresh token');
  }

  const user = await UserModel.findById(subject);
  if (!user) {
    throw createApiError(401, 'UNAUTHORIZED', 'Invalid refresh token');
  }

  return buildTokenPair(user.id);
};
