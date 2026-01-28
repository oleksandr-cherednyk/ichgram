import { type Request, type Response } from 'express';

import * as userService from '../services/user.service';
import type {
  UpdateProfileInput,
  UsernameParam,
  UserPostsQuery,
} from '../validations';

/**
 * GET /users/me
 * Get current authenticated user's profile
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const user = await userService.getCurrentUser(userId);

  res.json({ user });
};

/**
 * PATCH /users/me
 * Update current user's profile
 */
export const updateMe = async (
  req: Request<object, object, UpdateProfileInput>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const input = req.body;

  const user = await userService.updateProfile(userId, input);

  res.json({ user });
};

/**
 * POST /users/me/avatar
 * Upload and update avatar
 */
export const updateAvatar = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;

  if (!req.file?.path) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Image file is required',
      },
    });
    return;
  }

  const avatarUrl = req.file.path;
  const user = await userService.updateAvatar(userId, avatarUrl);

  res.json({ user });
};

/**
 * GET /users/:username
 * Get user profile by username
 */
export const getUser = async (
  req: Request<UsernameParam>,
  res: Response,
): Promise<void> => {
  const { username } = req.params;
  const user = await userService.getUserByUsername(username);

  res.json({ user });
};

/**
 * GET /users/:username/posts
 * Get user's posts with pagination
 */
export const getUserPosts = async (
  req: Request<UsernameParam, object, object, UserPostsQuery>,
  res: Response,
): Promise<void> => {
  const { username } = req.params;
  const { cursor, limit } = req.query;

  const result = await userService.getUserPosts(username, cursor, limit);

  res.json(result);
};
