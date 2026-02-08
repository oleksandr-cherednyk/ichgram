import { useInfiniteQuery } from '@tanstack/react-query';

import { apiRequest, buildCursorUrl } from '../lib/api';
import { useAuthStore } from '../stores/auth';
import type { NotificationsResponse } from '../types/notification';

/**
 * Hook to fetch notifications with infinite scroll pagination
 */
export const useNotifications = () => {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) =>
      apiRequest<NotificationsResponse>(
        buildCursorUrl('/notifications', pageParam),
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!accessToken,
  });
};
