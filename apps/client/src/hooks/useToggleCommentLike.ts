import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';
import type {
  CommentActionParams,
  CommentsResponse,
  LikeResponse,
} from '../types/post';

type ToggleCommentLikeParams = CommentActionParams & {
  isLiked: boolean;
};

export const useToggleCommentLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, commentId, isLiked }: ToggleCommentLikeParams) =>
      apiRequest<LikeResponse>(`/posts/${postId}/comments/${commentId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      }),
    onMutate: async ({ postId, commentId, isLiked }) => {
      const nextLiked = !isLiked;
      const delta = nextLiked ? 1 : -1;

      await queryClient.cancelQueries({ queryKey: ['comments', postId] });

      const previous = queryClient.getQueryData<{
        pages: CommentsResponse[];
        pageParams: (string | null)[];
      }>(['comments', postId]);

      queryClient.setQueryData<{
        pages: CommentsResponse[];
        pageParams: (string | null)[];
      }>(['comments', postId], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    isLiked: nextLiked,
                    likeCount: Math.max(0, comment.likeCount + delta),
                  }
                : comment,
            ),
          })),
        };
      });

      return { previous };
    },
    onError: (_error, { postId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['comments', postId], context.previous);
      }
    },
  });
};
