import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';
import { updatePostCache, updatePostInFeedCache } from '../lib/cache-updates';
import type { FeedPost, FeedResponse, LikeResponse } from '../types/post';

type ToggleLikeParams = {
  postId: string;
  isLiked: boolean;
};

export const useTogglePostLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isLiked }: ToggleLikeParams) =>
      apiRequest<LikeResponse>(`/posts/${postId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      }),
    onMutate: async ({ postId, isLiked }) => {
      const nextLiked = !isLiked;
      const delta = nextLiked ? 1 : -1;

      await queryClient.cancelQueries({ queryKey: ['posts', 'feed'] });
      await queryClient.cancelQueries({ queryKey: ['post', postId] });

      const previousFeed = queryClient.getQueryData<{
        pages: FeedResponse[];
        pageParams: (string | null)[];
      }>(['posts', 'feed']);
      const previousPost = queryClient.getQueryData<{ post: FeedPost }>([
        'post',
        postId,
      ]);

      updatePostInFeedCache(queryClient, postId, (post) => ({
        ...post,
        isLiked: nextLiked,
        likeCount: Math.max(0, post.likeCount + delta),
      }));

      updatePostCache(queryClient, postId, (post) => ({
        ...post,
        isLiked: nextLiked,
        likeCount: Math.max(0, post.likeCount + delta),
      }));

      return { previousFeed, previousPost };
    },
    onError: (_error, { postId }, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['posts', 'feed'], context.previousFeed);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
    },
  });
};
