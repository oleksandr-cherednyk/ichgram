import { z } from 'zod';

import { objectIdSchema } from './pagination';

export const notificationIdParamSchema = z.object({
  id: objectIdSchema('notification ID'),
});

export const notificationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>;
export type NotificationQuery = z.infer<typeof notificationQuerySchema>;
