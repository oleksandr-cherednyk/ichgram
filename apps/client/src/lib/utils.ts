import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Conversation } from '../types/chat';
import type { Notification } from '../types/notification';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatTimeAgo = (dateString?: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
};

export const buildNotificationText = (notification: Notification): string => {
  switch (notification.type) {
    case 'like':
      return 'liked your post';
    case 'comment':
      return 'commented on your post';
    case 'follow':
      return 'started following you';
    default:
      return 'sent you a notification';
  }
};

export const getOtherParticipant = (
  conversation: Conversation,
  currentUserId?: string | null,
) =>
  conversation.participants.find(
    (participant) => participant.id !== currentUserId,
  ) ?? conversation.participants[0];

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
