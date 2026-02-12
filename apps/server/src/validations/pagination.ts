import { z } from 'zod';

/** Regex for validating MongoDB ObjectId strings. */
export const OBJECT_ID_REGEX = /^[0-9a-f]{24}$/;

/** Zod string schema that validates a MongoDB ObjectId. */
export const objectIdSchema = (label = 'ID') =>
  z.string().regex(OBJECT_ID_REGEX, `Invalid ${label} format`);

// Shared pagination query validation for list endpoints.
export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
