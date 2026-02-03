import { Router } from 'express';

import * as commentController from '../controllers/comment.controller';
import * as likeController from '../controllers/like.controller';
import * as postController from '../controllers/post.controller';
import { requireAuth, uploadSingle, validate } from '../middlewares';
import {
  commentIdParamSchema,
  commentSchema,
  createPostSchema,
  feedQuerySchema,
  homeFeedQuerySchema,
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
 * Get home feed with random posts from followed users
 * Query params: ?limit=<number>&exclude=<comma-separated-ids>
 */
postRouter.get(
  '/feed',
  validate({ query: homeFeedQuerySchema }),
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
 * GET /posts/top
 * Get top 10 posts sorted by like count (for explore grid)
 */
postRouter.get('/top', postController.getTopPosts);

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
 * Update post caption and/or image (owner only)
 */
postRouter.patch(
  '/:id',
  uploadSingle('image'),
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

// ============================================================================
// Like Routes
// ============================================================================

/**
 * POST /posts/:id/like
 * Like a post
 */
postRouter.post(
  '/:id/like',
  validate({ params: postIdParamSchema }),
  likeController.likePost,
);

/**
 * DELETE /posts/:id/like
 * Unlike a post
 */
postRouter.delete(
  '/:id/like',
  validate({ params: postIdParamSchema }),
  likeController.unlikePost,
);

// ============================================================================
// Comment Routes
// ============================================================================

/**
 * GET /posts/:id/comments
 * Get comments for a post with cursor pagination
 */
postRouter.get(
  '/:id/comments',
  validate({ params: postIdParamSchema, query: feedQuerySchema }),
  commentController.getComments,
);

/**
 * POST /posts/:id/comments
 * Create a comment on a post
 */
postRouter.post(
  '/:id/comments',
  validate({ params: postIdParamSchema, body: commentSchema }),
  commentController.createComment,
);

/**
 * DELETE /posts/:id/comments/:commentId
 * Delete a comment (author only)
 */
postRouter.delete(
  '/:id/comments/:commentId',
  validate({ params: postIdParamSchema.merge(commentIdParamSchema) }),
  commentController.deleteComment,
);

/**
 * POST /posts/:id/comments/:commentId/like
 * Like a comment
 */
postRouter.post(
  '/:id/comments/:commentId/like',
  validate({ params: postIdParamSchema.merge(commentIdParamSchema) }),
  commentController.likeComment,
);

/**
 * DELETE /posts/:id/comments/:commentId/like
 * Unlike a comment
 */
postRouter.delete(
  '/:id/comments/:commentId/like',
  validate({ params: postIdParamSchema.merge(commentIdParamSchema) }),
  commentController.unlikeComment,
);
