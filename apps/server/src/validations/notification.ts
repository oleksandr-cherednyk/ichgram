import { z } from 'zod';

import { objectIdSchema, paginationQuerySchema } from './pagination';

export const notificationIdParamSchema = z.object({
  id: objectIdSchema('notification ID'),
});

export const notificationQuerySchema = paginationQuerySchema;

export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>;
export type NotificationQuery = z.infer<typeof notificationQuerySchema>;
