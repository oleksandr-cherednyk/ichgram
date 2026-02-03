import { Router } from 'express';

import * as notificationController from '../controllers/notification.controller';
import { requireAuth, validate } from '../middlewares';
import {
  notificationIdParamSchema,
  notificationQuerySchema,
} from '../validations';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);

/**
 * GET /notifications
 * List notifications with cursor pagination
 */
notificationRouter.get(
  '/',
  validate({ query: notificationQuerySchema }),
  notificationController.getNotifications,
);

/**
 * GET /notifications/unread-count
 * Get unread notifications count
 */
notificationRouter.get('/unread-count', notificationController.getUnreadCount);

/**
 * DELETE /notifications
 * Clear all notifications
 */
notificationRouter.delete('/', notificationController.clearAll);

/**
 * PATCH /notifications/:id/read
 * Mark notification as read
 */
notificationRouter.patch(
  '/:id/read',
  validate({ params: notificationIdParamSchema }),
  notificationController.markAsRead,
);
