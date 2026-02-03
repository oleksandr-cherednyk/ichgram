import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';
import type { UnreadCountResponse } from '../types/notification';

/**
 * Hook to fetch unread notifications count with polling
 */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () =>
      apiRequest<UnreadCountResponse>('/notifications/unread-count'),
    refetchInterval: 120000,
  });
};
