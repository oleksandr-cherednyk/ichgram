import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiRequest } from '../lib/api';
import { updatePostCache, updatePostInFeedCache } from '../lib/cache-updates';
import type { CommentsResponse } from '../types/post';

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
      updatePostInFeedCache(queryClient, postId, (post) => ({
        ...post,
        commentCount: Math.max(0, post.commentCount - 1),
      }));

      // Update comment count in single post
      updatePostCache(queryClient, postId, (post) => ({
        ...post,
        commentCount: Math.max(0, post.commentCount - 1),
      }));
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });
};
