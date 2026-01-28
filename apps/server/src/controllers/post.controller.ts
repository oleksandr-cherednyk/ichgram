import { type Request, type Response } from 'express';

import * as postService from '../services/post.service';
import type {
  CreatePostInput,
  FeedQuery,
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
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Image file is required',
      },
    });
    return;
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
  const post = await postService.getPostById(id);

  res.json({ post });
};

/**
 * PATCH /posts/:id
 * Update post caption (only owner can update)
 */
export const updatePost = async (
  req: Request<PostIdParam, object, UpdatePostInput>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId!;
  const input = req.body;

  const post = await postService.updatePost(id, userId, input);

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
 * Get home feed with cursor pagination
 */
export const getFeed = async (
  req: Request<object, object, object, FeedQuery>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { cursor, limit } = req.query;

  const result = await postService.getFeed(userId, cursor, limit);

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
  const userId = req.userId!;
  const { cursor, limit } = req.query;

  const result = await postService.getExplorePosts(userId, cursor, limit);

  res.json(result);
};
