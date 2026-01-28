import { useInfiniteQuery } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';
import type { PaginatedResponse, UserPostItem } from '../types/user';

/**
 * Hook to get user's posts with infinite scroll
 */
export const useUserPosts = (username: string) => {
  return useInfiniteQuery({
    queryKey: ['posts', 'user', username],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set('cursor', pageParam);
      const query = params.toString();
      return apiRequest<PaginatedResponse<UserPostItem>>(
        `/users/${username}/posts${query ? `?${query}` : ''}`,
      );
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!username,
  });
};
