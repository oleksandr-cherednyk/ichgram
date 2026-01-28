import { z } from 'zod';

import { paginationQuerySchema } from './pagination';

// Instagram caption max length
const MAX_CAPTION_LENGTH = 2200;

/**
 * Validation schema for creating a post
 * Image is validated by multer middleware
 */
export const createPostSchema = z.object({
  caption: z.string().max(MAX_CAPTION_LENGTH).optional().default(''),
});

/**
 * Validation schema for updating a post
 */
export const updatePostSchema = z.object({
  caption: z.string().max(MAX_CAPTION_LENGTH),
});

/**
 * Validation schema for post ID param
 * MongoDB ObjectId is 24 hex characters
 */
export const postIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-f]{24}$/, 'Invalid post ID format'),
});

/**
 * Validation schema for feed/explore query params
 * Extends pagination schema with cursor + limit
 */
export const feedQuerySchema = paginationQuerySchema;

// Export types
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostIdParam = z.infer<typeof postIdParamSchema>;
export type FeedQuery = z.infer<typeof feedQuerySchema>;
