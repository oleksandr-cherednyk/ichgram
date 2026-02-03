import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiRequest } from '../lib/api';
import type { CommentsResponse, FeedPost, FeedResponse } from '../types/post';

type DeleteCommentParams = {
  postId: string;
  commentId: string;
};

/**
 * Hook to delete a comment from a post
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, commentId }: DeleteCommentParams) =>
      apiRequest<void>(`/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_data, { postId, commentId }) => {
      // Remove the comment from the comments cache
      queryClient.setQueryData<{
        pages: CommentsResponse[];
        pageParams: (string | null)[];
      }>(['comments', postId], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((comment) => comment.id !== commentId),
          })),
        };
      });

      // Update comment count in feed
      queryClient.setQueryData<{
        pages: FeedResponse[];
        pageParams: (string | null)[];
      }>(['posts', 'feed'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((post) =>
              post.id === postId
                ? { ...post, commentCount: Math.max(0, post.commentCount - 1) }
                : post,
            ),
          })),
        };
      });

      // Update comment count in single post
      queryClient.setQueryData<{ post: FeedPost }>(['post', postId], (old) => {
        if (!old) return old;
        return {
          ...old,
          post: {
            ...old.post,
            commentCount: Math.max(0, old.post.commentCount - 1),
          },
        };
      });
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });
};
