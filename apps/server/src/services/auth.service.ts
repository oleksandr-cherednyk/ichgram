import bcrypt from 'bcrypt';

import { UserModel } from '../models';
import {
  createApiError,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils';
import { type LoginInput, type RegisterInput } from '../validations';

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

type AuthResult = {
  user: {
    id: string;
    email: string;
    fullName: string;
    username: string;
    avatarUrl: string | null;
  };
} & TokenPair;

const SALT_ROUNDS = 10;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const buildTokenPair = (userId: string): TokenPair => ({
  accessToken: signAccessToken(userId),
  refreshToken: signRefreshToken(userId),
});

const buildAuthResult = (user: {
  _id: { toString(): string };
  email: string;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
}): AuthResult => {
  const id = user._id.toString();
  return {
    user: {
      id,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      avatarUrl: user.avatarUrl ?? null,
    },
    ...buildTokenPair(id),
  };
};

export const registerUser = async (
  input: RegisterInput,
): Promise<AuthResult> => {
  const email = normalizeEmail(input.email);
  const existing = await UserModel.findOne({
    $or: [{ email }, { username: input.username }],
  }).lean();

  if (existing) {
    throw createApiError(409, 'CONFLICT', 'Email or username already in use');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await UserModel.create({
    email,
    fullName: input.fullName,
    username: input.username,
    passwordHash,
  });

  return buildAuthResult(user);
};

export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
  const user = await UserModel.findOne({
    email: normalizeEmail(input.email),
  })
    .select('+passwordHash')
    .lean();
  if (!user) {
    throw createApiError(401, 'UNAUTHORIZED', 'Invalid credentials');
  }

  const matches = await bcrypt.compare(input.password, user.passwordHash);
  if (!matches) {
    throw createApiError(401, 'UNAUTHORIZED', 'Invalid credentials');
  }

  return buildAuthResult(user);
};

export const refreshSession = async (token: string): Promise<TokenPair> => {
  let userId: string;
  try {
    const payload = verifyRefreshToken(token);
    if (typeof payload.sub !== 'string') throw new Error();
    userId = payload.sub;
  } catch {
    throw createApiError(401, 'UNAUTHORIZED', 'Invalid refresh token');
  }

  const user = await UserModel.findById(userId).lean();
  if (!user) {
    throw createApiError(401, 'UNAUTHORIZED', 'Invalid refresh token');
  }

  return buildTokenPair(user._id.toString());
};
