import { Router } from 'express';

import * as postController from '../controllers/post.controller';
import { requireAuth, uploadSingle, validate } from '../middlewares';
import {
  createPostSchema,
  feedQuerySchema,
  postIdParamSchema,
  updatePostSchema,
} from '../validations';

export const postRouter = Router();

// All post routes require authentication
postRouter.use(requireAuth);

/**
 * POST /posts
 * Create a new post with image upload
 * - Requires multipart/form-data with 'image' field
 * - Caption is optional in request body
 */
postRouter.post(
  '/',
  uploadSingle('image'), // multer + sharp processing
  validate({ body: createPostSchema }),
  postController.createPost,
);

/**
 * GET /posts/feed
 * Get home feed with cursor pagination
 * Query params: ?cursor=<opaque>&limit=<number>
 */
postRouter.get(
  '/feed',
  validate({ query: feedQuerySchema }),
  postController.getFeed,
);

/**
 * GET /posts/explore
 * Get explore posts with cursor pagination
 * Query params: ?cursor=<opaque>&limit=<number>
 */
postRouter.get(
  '/explore',
  validate({ query: feedQuerySchema }),
  postController.getExplorePosts,
);

/**
 * GET /posts/:id
 * Get post details by ID (for modal view)
 */
postRouter.get(
  '/:id',
  validate({ params: postIdParamSchema }),
  postController.getPost,
);

/**
 * PATCH /posts/:id
 * Update post caption (owner only)
 */
postRouter.patch(
  '/:id',
  validate({
    params: postIdParamSchema,
    body: updatePostSchema,
  }),
  postController.updatePost,
);

/**
 * DELETE /posts/:id
 * Delete post (owner only)
 */
postRouter.delete(
  '/:id',
  validate({ params: postIdParamSchema }),
  postController.deletePost,
);
