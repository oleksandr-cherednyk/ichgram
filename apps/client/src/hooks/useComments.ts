import { useInfiniteQuery } from '@tanstack/react-query';

import { apiRequest, buildCursorUrl } from '../lib/api';
import type { CommentsResponse } from '../types/post';

/**
 * Hook to fetch comments for a post with infinite scroll pagination
 */
export const useComments = (postId: string) => {
  return useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: ({ pageParam }) =>
      apiRequest<CommentsResponse>(
        buildCursorUrl(`/posts/${postId}/comments`, pageParam),
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!postId,
  });
};
