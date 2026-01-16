import { z } from 'zod';

// Shared pagination query validation for list endpoints.
export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});
