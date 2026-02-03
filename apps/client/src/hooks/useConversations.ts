import { useInfiniteQuery } from '@tanstack/react-query';

import { apiRequest, buildCursorUrl } from '../lib/api';
import type { ConversationsResponse } from '../types/chat';

/**
 * Hook to fetch conversations with infinite scroll pagination
 */
export const useConversations = () => {
  return useInfiniteQuery({
    queryKey: ['conversations'],
    queryFn: ({ pageParam }) =>
      apiRequest<ConversationsResponse>(
        buildCursorUrl('/conversations', pageParam),
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
};
