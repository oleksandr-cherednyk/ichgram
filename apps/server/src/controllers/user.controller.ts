import { type Request, type Response } from 'express';

import * as userService from '../services/user.service';
import { createApiError } from '../utils';
import type {
  UpdateProfileInput,
  UsernameParam,
  UserPostsQuery,
  UserSearchQuery,
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
    throw createApiError(400, 'VALIDATION_ERROR', 'Image file is required');
  }

  const avatarUrl = req.file.path;
  const user = await userService.updateAvatar(userId, avatarUrl);

  res.json({ user });
};

/**
 * GET /users/:username
 * Get user profile by username
 * Includes isFollowing status if authenticated
 */
export const getUser = async (
  req: Request<UsernameParam>,
  res: Response,
): Promise<void> => {
  const { username } = req.params;
  const currentUserId = req.userId; // May be undefined if not authenticated
  const user = await userService.getUserByUsername(username, currentUserId);

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

/**
 * GET /users/search
 * Search users by username or fullName
 */
export const searchUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { q, cursor, limit } = req.query as unknown as UserSearchQuery;

  const result = await userService.searchUsers(q, cursor, limit);

  res.json(result);
};
