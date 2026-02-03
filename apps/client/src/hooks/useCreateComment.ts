import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiRequest } from '../lib/api';
import type {
  CommentsResponse,
  CreateCommentResponse,
  FeedPost,
  FeedResponse,
} from '../types/post';

type CreateCommentParams = {
  postId: string;
  text: string;
};

/**
 * Hook to create a comment on a post
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, text }: CreateCommentParams) =>
      apiRequest<CreateCommentResponse>(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      }),
    onSuccess: (data, { postId }) => {
      // Add the new comment to the comments cache
      queryClient.setQueryData<{
        pages: CommentsResponse[];
        pageParams: (string | null)[];
      }>(['comments', postId], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page, index) =>
            index === 0
              ? { ...page, data: [data.comment, ...page.data] }
              : page,
          ),
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
                ? { ...post, commentCount: post.commentCount + 1 }
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
            commentCount: old.post.commentCount + 1,
          },
        };
      });
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });
};
