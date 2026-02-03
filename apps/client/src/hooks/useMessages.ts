import { useInfiniteQuery } from '@tanstack/react-query';

import { apiRequest, buildCursorUrl } from '../lib/api';
import type { MessagesResponse } from '../types/chat';

/**
 * Hook to fetch messages for a conversation
 */
export const useMessages = (conversationId: string | null) => {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: ({ pageParam }) =>
      apiRequest<MessagesResponse>(
        buildCursorUrl(`/conversations/${conversationId}/messages`, pageParam),
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: Boolean(conversationId),
  });
};
