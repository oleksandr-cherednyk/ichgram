import { type Request, type Response } from 'express';

import * as postService from '../services/post.service';
import { createApiError } from '../utils';
import { OBJECT_ID_REGEX } from '../validations/pagination';
import type {
  CreatePostInput,
  FeedQuery,
  HomeFeedQuery,
  PostIdParam,
  UpdatePostInput,
} from '../validations';

/**
 * POST /posts
 * Create a new post with image and caption
 */
export const createPost = async (
  req: Request<object, object, CreatePostInput>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!; // Set by requireAuth middleware
  const input = req.body;

  // Image path is set by upload middleware
  if (!req.file?.path) {
    throw createApiError(400, 'VALIDATION_ERROR', 'Image file is required');
  }

  const imageUrl = req.file.path;
  const post = await postService.createPost(userId, input, imageUrl);

  res.status(201).json({ post });
};

/**
 * GET /posts/:id
 * Get post details by ID (for modal view)
 */
export const getPost = async (
  req: Request<PostIdParam>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;
  const post = await postService.getPostById(id, userId);

  res.json({ post });
};

/**
 * PATCH /posts/:id
 * Update post caption and/or image (owner only)
 */
export const updatePost = async (
  req: Request<PostIdParam, object, UpdatePostInput>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId!;
  const input = req.body;
  const imageUrl = req.file?.path;

  const post = await postService.updatePost(id, userId, input, imageUrl);

  res.json({ post });
};

/**
 * DELETE /posts/:id
 * Delete post (only owner can delete)
 */
export const deletePost = async (
  req: Request<PostIdParam>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId!;

  await postService.deletePost(id, userId);

  res.status(204).send();
};

/**
 * GET /posts/feed
 * Get home feed with random posts from followed users
 */
export const getFeed = async (
  req: Request<object, object, object, HomeFeedQuery>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { exclude, limit } = req.query;

  const excludeIds = exclude
    ? exclude.split(',').filter((id) => OBJECT_ID_REGEX.test(id))
    : [];

  const result = await postService.getFeed(userId, excludeIds, limit);

  res.json(result);
};

/**
 * GET /posts/explore
 * Get explore posts with cursor pagination
 */
export const getExplorePosts = async (
  req: Request<object, object, object, FeedQuery>,
  res: Response,
): Promise<void> => {
  const { cursor, limit } = req.query;

  const result = await postService.getExplorePosts(cursor, limit);

  res.json(result);
};

/**
 * GET /posts/top
 * Get top 10 posts sorted by like count
 */
export const getTopPosts = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const posts = await postService.getTopPosts(10);

  res.json({ data: posts });
};
