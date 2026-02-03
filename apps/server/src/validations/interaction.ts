import { z } from 'zod';

import { objectIdSchema } from './pagination';

/**
 * Validation schema for creating a comment
 */
export const commentSchema = z.object({
  text: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment too long'),
});

/**
 * Validation schema for comment ID param
 */
export const commentIdParamSchema = z.object({
  commentId: objectIdSchema('comment ID'),
});

// Export types
export type CommentInput = z.infer<typeof commentSchema>;
export type CommentIdParam = z.infer<typeof commentIdParamSchema>;
