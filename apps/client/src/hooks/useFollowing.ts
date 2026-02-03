import { useInfiniteQuery } from '@tanstack/react-query';

import { apiRequest, buildCursorUrl } from '../lib/api';
import type { FollowListResponse } from '../types/user';

export const useFollowing = (username: string, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ['following', username],
    queryFn: ({ pageParam }) =>
      apiRequest<FollowListResponse>(
        buildCursorUrl(`/users/${username}/following`, pageParam),
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!username && enabled,
  });
};
