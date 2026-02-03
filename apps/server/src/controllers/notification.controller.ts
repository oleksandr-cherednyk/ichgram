import { type Request, type Response } from 'express';

import * as notificationService from '../services/notification.service';
import type { NotificationIdParam, NotificationQuery } from '../validations';

/**
 * GET /notifications
 * Get notifications for current user
 */
export const getNotifications = async (
  req: Request<object, object, object, NotificationQuery>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { cursor, limit } = req.query;

  const result = await notificationService.getNotifications(
    userId,
    cursor,
    limit,
  );

  res.json(result);
};

/**
 * GET /notifications/unread-count
 * Get unread notifications count
 */
export const getUnreadCount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const count = await notificationService.getUnreadCount(userId);

  res.json({ count });
};

/**
 * DELETE /notifications
 * Clear all notifications
 */
export const clearAll = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  await notificationService.clearAll(userId);
  res.json({ ok: true });
};

/**
 * PATCH /notifications/:id/read
 * Mark a notification as read
 */
export const markAsRead = async (
  req: Request<NotificationIdParam>,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { id } = req.params;

  const readAt = await notificationService.markAsRead(userId, id);

  res.json({ readAt });
};
