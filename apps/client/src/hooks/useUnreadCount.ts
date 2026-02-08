import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';
import { useAuthStore } from '../stores/auth';
import type { UnreadCountResponse } from '../types/notification';

/**
 * Hook to fetch unread notifications count with polling
 */
export const useUnreadCount = () => {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () =>
      apiRequest<UnreadCountResponse>('/notifications/unread-count'),
    refetchInterval: 120000,
    enabled: !!accessToken,
  });
};
