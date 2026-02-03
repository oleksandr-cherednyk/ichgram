import { type Request, type Response } from 'express';

import * as commentService from '../services/comment.service';
import type {
  CommentIdParam,
  CommentInput,
  FeedQuery,
  PostIdParam,
} from '../validations';

/**
 * POST /posts/:id/comments
 * Create a comment on a post
 */
export const createComment = async (
  req: Request<PostIdParam, object, CommentInput>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { id: postId } = req.params;
  const { text } = req.body;

  const comment = await commentService.createComment(userId, postId, text);

  res.status(201).json({ comment });
};

/**
 * GET /posts/:id/comments
 * Get comments for a post with cursor pagination
 */
export const getComments = async (
  req: Request<PostIdParam, object, object, FeedQuery>,
  res: Response,
): Promise<void> => {
  const userId = req.userId;
  const { id: postId } = req.params;
  const { cursor, limit } = req.query;

  const result = await commentService.getPostComments(
    postId,
    cursor,
    limit,
    userId,
  );

  res.json(result);
};

/**
 * DELETE /posts/:id/comments/:commentId
 * Delete a comment (only author can delete)
 */
export const deleteComment = async (
  req: Request<PostIdParam & CommentIdParam>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { commentId } = req.params;

  await commentService.deleteComment(userId, commentId);

  res.status(204).send();
};

/**
 * POST /posts/:id/comments/:commentId/like
 * Like a comment
 */
export const likeComment = async (
  req: Request<PostIdParam & CommentIdParam>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { commentId } = req.params;

  const result = await commentService.likeComment(userId, commentId);

  res.json(result);
};

/**
 * DELETE /posts/:id/comments/:commentId/like
 * Unlike a comment
 */
export const unlikeComment = async (
  req: Request<PostIdParam & CommentIdParam>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { commentId } = req.params;

  const result = await commentService.unlikeComment(userId, commentId);

  res.json(result);
};
