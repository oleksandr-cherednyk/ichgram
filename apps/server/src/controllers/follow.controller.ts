import { type Request, type Response } from 'express';

import * as followService from '../services/follow.service';
import type { UsernameParam, UserPostsQuery } from '../validations';

/**
 * POST /users/:username/follow
 * Follow a user
 */
export const followUser = async (
  req: Request<UsernameParam>,
  res: Response,
): Promise<void> => {
  const followerId = req.userId!;
  const { username } = req.params;

  const result = await followService.followUser(followerId, username);

  res.status(result.followed ? 201 : 200).json(result);
};

/**
 * DELETE /users/:username/follow
 * Unfollow a user
 */
export const unfollowUser = async (
  req: Request<UsernameParam>,
  res: Response,
): Promise<void> => {
  const followerId = req.userId!;
  const { username } = req.params;

  const result = await followService.unfollowUser(followerId, username);

  res.json(result);
};

/**
 * GET /users/:username/followers
 * Get user's followers with pagination
 */
export const getFollowers = async (
  req: Request<UsernameParam, object, object, UserPostsQuery>,
  res: Response,
): Promise<void> => {
  const { username } = req.params;
  const { cursor, limit } = req.query;

  const result = await followService.getFollowers(username, cursor, limit);

  res.json(result);
};

/**
 * GET /users/:username/following
 * Get users that user is following with pagination
 */
export const getFollowing = async (
  req: Request<UsernameParam, object, object, UserPostsQuery>,
  res: Response,
): Promise<void> => {
  const { username } = req.params;
  const { cursor, limit } = req.query;

  const result = await followService.getFollowing(username, cursor, limit);

  res.json(result);
};
