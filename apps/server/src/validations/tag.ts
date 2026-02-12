import { z } from 'zod';

import { paginationQuerySchema } from './pagination';

/**
 * Validation for tag search query
 */
export const tagSearchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

/**
 * Validation for tag param (in URL path)
 */
export const tagParamSchema = z.object({
  tag: z.string().min(1).max(200),
});

/**
 * Validation for tag posts pagination query
 */
export const tagPostsQuerySchema = paginationQuerySchema;

// Export types
export type TagSearchQuery = z.infer<typeof tagSearchQuerySchema>;
export type TagParam = z.infer<typeof tagParamSchema>;
export type TagPostsQuery = z.infer<typeof tagPostsQuerySchema>;
