import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { getSocket } from '../lib/socket';
import type {
  Notification,
  NotificationsResponse,
  UnreadCountResponse,
} from '../types/notification';

export const useSocketNotifications = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    const handleNotification = (payload: { notification: Notification }) => {
      const { notification } = payload;

      // Prepend to notifications cache
      queryClient.setQueryData<{
        pages: NotificationsResponse[];
        pageParams: (string | null)[];
      }>(['notifications'], (old) => {
        if (!old) {
          return {
            pages: [{ data: [notification], nextCursor: null, hasMore: false }],
            pageParams: [null],
          };
        }

        return {
          ...old,
          pages: old.pages.map((page, index) =>
            index === 0
              ? { ...page, data: [notification, ...page.data] }
              : page,
          ),
        };
      });

      // Increment unread count
      queryClient.setQueryData<UnreadCountResponse>(
        ['notifications', 'unread-count'],
        (old) => ({ count: (old?.count ?? 0) + 1 }),
      );

      // Invalidate post data so likes/comments update in real-time
      if (notification.post) {
        const postId = notification.post.id;
        queryClient.invalidateQueries({ queryKey: ['post', postId] });
        queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });

        if (notification.type === 'comment') {
          queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        }
      }
    };

    socket.on('notification:new', handleNotification);

    return () => {
      socket.off('notification:new', handleNotification);
    };
  }, [queryClient]);
};
