import { type Request, type Response } from 'express';

import * as likeService from '../services/like.service';
import type { PostIdParam } from '../validations';

/**
 * POST /posts/:id/like
 * Like a post
 */
export const likePost = async (
  req: Request<PostIdParam>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { id: postId } = req.params;

  const isNew = await likeService.likePost(userId, postId);

  // Return 201 if new like, 200 if already liked
  res.status(isNew ? 201 : 200).json({ liked: true });
};

/**
 * DELETE /posts/:id/like
 * Unlike a post
 */
export const unlikePost = async (
  req: Request<PostIdParam>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { id: postId } = req.params;

  await likeService.unlikePost(userId, postId);

  res.json({ liked: false });
};
