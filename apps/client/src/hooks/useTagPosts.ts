import { useInfiniteQuery } from '@tanstack/react-query';

import { apiRequest, buildCursorUrl } from '../lib/api';
import type { TagPostsResponse } from '../types/search';

/**
 * Hook to fetch posts by tag with infinite scroll pagination
 */
export const useTagPosts = (tag: string) => {
  return useInfiniteQuery({
    queryKey: ['tags', tag, 'posts'],
    queryFn: ({ pageParam }) =>
      apiRequest<TagPostsResponse>(
        buildCursorUrl(`/tags/${encodeURIComponent(tag)}/posts`, pageParam),
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!tag,
  });
};
