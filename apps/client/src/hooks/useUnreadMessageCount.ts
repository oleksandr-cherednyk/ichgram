import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';
import { useAuthStore } from '../stores/auth';
import type { UnreadMessageCountResponse } from '../types/chat';

/**
 * Hook to fetch total unread messages count with polling
 */
export const useUnreadMessageCount = () => {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['messages', 'unread-count'],
    queryFn: () =>
      apiRequest<UnreadMessageCountResponse>('/conversations/unread-count'),
    refetchInterval: 30000,
    enabled: !!accessToken,
  });
};
