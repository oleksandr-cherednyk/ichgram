import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';
import type { FeedPost } from '../types/post';

type PostResponse = {
  post: FeedPost;
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => apiRequest<PostResponse>(`/posts/${postId}`),
    select: (data) => data.post,
    enabled: !!postId,
  });
};
