type NotificationActor = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
};

type NotificationPost = {
  id: string;
  imageUrl: string | null;
};

export type NotificationType = 'like' | 'comment' | 'follow';

export type Notification = {
  id: string;
  type: NotificationType;
  actor: NotificationActor;
  post: NotificationPost | null;
  commentId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationsResponse = {
  data: Notification[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type UnreadCountResponse = {
  count: number;
};
