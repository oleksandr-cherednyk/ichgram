import { useInfiniteQuery } from '@tanstack/react-query';

import { apiRequest, buildCursorUrl } from '../lib/api';
import type { PaginatedResponse, UserPostItem } from '../types/user';

/**
 * Hook to get user's posts with infinite scroll
 */
export const useUserPosts = (username: string) => {
  return useInfiniteQuery({
    queryKey: ['posts', 'user', username],
    queryFn: ({ pageParam }) =>
      apiRequest<PaginatedResponse<UserPostItem>>(
        buildCursorUrl(`/users/${username}/posts`, pageParam),
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!username,
  });
};
