import { useInfiniteQuery } from '@tanstack/react-query';

import { apiRequest, buildCursorUrl } from '../lib/api';
import type { NotificationsResponse } from '../types/notification';

/**
 * Hook to fetch notifications with infinite scroll pagination
 */
export const useNotifications = () => {
  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) =>
      apiRequest<NotificationsResponse>(
        buildCursorUrl('/notifications', pageParam),
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
};
