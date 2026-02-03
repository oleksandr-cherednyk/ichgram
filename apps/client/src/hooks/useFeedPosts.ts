import { useInfiniteQuery } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';
import type { HomeFeedResponse } from '../types/post';

/**
 * Hook to fetch home feed posts with random sampling
 * Uses exclude-based pagination to avoid duplicate posts across pages
 */
export const useFeedPosts = () => {
  return useInfiniteQuery({
    queryKey: ['posts', 'feed'],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam && pageParam.length > 0) {
        params.set('exclude', pageParam.join(','));
      }
      const query = params.toString();
      return apiRequest<HomeFeedResponse>(
        `/posts/feed${query ? `?${query}` : ''}`,
      );
    },
    initialPageParam: [] as string[],
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      // Collect all post IDs seen so far to exclude from next request
      const allIds = allPages.flatMap((page) => page.data.map((p) => p.id));
      return allIds;
    },
  });
};
