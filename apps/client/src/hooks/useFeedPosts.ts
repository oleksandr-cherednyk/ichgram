import { useInfiniteQuery } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';
import { useAuthStore } from '../stores/auth';
import type { HomeFeedResponse } from '../types/post';

/**
 * Hook to fetch home feed posts with random sampling
 * Uses exclude-based pagination to avoid duplicate posts across pages
 */
export const useFeedPosts = () => {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useInfiniteQuery({
    queryKey: ['posts', 'feed'],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('limit', '4');
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
    enabled: !!accessToken,
  });
};
