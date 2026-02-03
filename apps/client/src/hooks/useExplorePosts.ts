import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';
import type { FeedPost } from '../types/post';

type TopPostsResponse = {
  data: FeedPost[];
};

/**
 * Hook to fetch top posts by like count for the explore grid
 */
export const useExplorePosts = () => {
  return useQuery({
    queryKey: ['posts', 'top'],
    queryFn: () => apiRequest<TopPostsResponse>('/posts/top'),
    select: (res) => res.data,
  });
};
