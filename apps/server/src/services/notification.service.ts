import { Types } from 'mongoose';

import { NotificationModel } from '../models';
import { getIO } from '../sockets';
import {
  createApiError,
  decodeCursor,
  encodeCursor,
  parseLimit,
  type PaginationResult,
} from '../utils';

// ============================================================================
// Types
// ==========================================================================

export type NotificationType = 'like' | 'comment' | 'follow';

export type NotificationActor = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
};

export type NotificationPost = {
  id: string;
  imageUrl: string | null;
};

export type NotificationItem = {
  id: string;
  type: NotificationType;
  actor: NotificationActor;
  post: NotificationPost | null;
  commentId: string | null;
  readAt: string | null;
  createdAt: string;
};

type CreateNotificationInput = {
  userId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
};

type PopulatedNotificationDoc = {
  _id: Types.ObjectId;
  type: NotificationType;
  actorId: {
    _id: Types.ObjectId;
    username: string;
    fullName: string;
    avatarUrl?: string;
  };
  postId?: {
    _id: Types.ObjectId;
    imageUrl?: string;
  } | null;
  commentId?: Types.ObjectId | null;
  readAt?: Date | null;
  createdAt: Date;
};

const unreadFilter = {
  $or: [{ readAt: { $exists: false } }, { readAt: null }],
};

const formatNotification = (
  notification: PopulatedNotificationDoc,
): NotificationItem => ({
  id: notification._id.toString(),
  type: notification.type,
  actor: {
    id: notification.actorId._id.toString(),
    username: notification.actorId.username,
    fullName: notification.actorId.fullName,
    avatarUrl: notification.actorId.avatarUrl ?? null,
  },
  post: notification.postId
    ? {
        id: notification.postId._id.toString(),
        imageUrl: notification.postId.imageUrl ?? null,
      }
    : null,
  commentId: notification.commentId ? notification.commentId.toString() : null,
  readAt: notification.readAt ? notification.readAt.toISOString() : null,
  createdAt: notification.createdAt.toISOString(),
});

// ============================================================================
// CRUD Operations
// ==========================================================================

export const createNotification = async (
  input: CreateNotificationInput,
): Promise<boolean> => {
  if (input.userId === input.actorId) {
    return false;
  }

  const notification = await NotificationModel.create({
    userId: input.userId,
    actorId: input.actorId,
    type: input.type,
    postId: input.postId,
    commentId: input.commentId,
  });

  // Emit real-time notification via socket
  try {
    const populated = await notification.populate([
      { path: 'actorId', select: 'username fullName avatarUrl' },
      { path: 'postId', select: 'imageUrl' },
    ]);

    const formatted = formatNotification(
      populated as unknown as PopulatedNotificationDoc,
    );

    getIO()
      .to(`user:${input.userId}`)
      .emit('notification:new', { notification: formatted });
  } catch {
    // Socket emission is best-effort, don't fail the request
  }

  return true;
};

export const getNotifications = async (
  userId: string,
  cursorParam?: string | null,
  limitParam?: number | string | null,
): Promise<PaginationResult<NotificationItem>> => {
  const limit = parseLimit(limitParam);
  const cursor = decodeCursor(cursorParam);

  const query: {
    userId: string;
    createdAt?: { $lt: Date };
    _id?: { $ne: string };
  } = { userId };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor.createdAt) };
    query._id = { $ne: cursor.id };
  }

  const notifications = await NotificationModel.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate('actorId', 'username fullName avatarUrl')
    .populate('postId', 'imageUrl');

  const hasMore = notifications.length > limit;
  const data = notifications.slice(0, limit);

  let nextCursor: string | null = null;
  if (hasMore && data.length > 0) {
    const lastNotification = data[data.length - 1];
    nextCursor = encodeCursor({
      createdAt: lastNotification.createdAt.toISOString(),
      id: lastNotification._id.toString(),
    });
  }

  return {
    data: data.map((notification) =>
      formatNotification(notification as unknown as PopulatedNotificationDoc),
    ),
    nextCursor,
    hasMore,
  };
};

export const markAsRead = async (
  userId: string,
  notificationId: string,
): Promise<string | null> => {
  const notification = await NotificationModel.findOne({
    _id: notificationId,
    userId,
  });

  if (!notification) {
    throw createApiError(404, 'NOT_FOUND', 'Notification not found');
  }

  if (!notification.readAt) {
    notification.readAt = new Date();
    await notification.save();
  }

  return notification.readAt ? notification.readAt.toISOString() : null;
};

export const clearAll = async (userId: string): Promise<void> => {
  await NotificationModel.deleteMany({ userId });
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  return NotificationModel.countDocuments({ userId, ...unreadFilter });
};
