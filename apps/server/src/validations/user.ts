import { z } from 'zod';

import { paginationQuerySchema } from './pagination';

/**
 * Validation for updating user profile
 */
export const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  bio: z.string().max(160).optional(),
});

/**
 * Validation for username param
 */
export const usernameParamSchema = z.object({
  username: z.string().min(1).max(30),
});

/**
 * Validation for user posts query
 */
export const userPostsQuerySchema = paginationQuerySchema;

// Export types
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UsernameParam = z.infer<typeof usernameParamSchema>;
export type UserPostsQuery = z.infer<typeof userPostsQuerySchema>;
