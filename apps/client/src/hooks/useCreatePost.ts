import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiUpload } from '../lib/api';
import type { CreatePostResponse } from '../types/post';

type CreatePostInput = {
  image: File;
  caption?: string;
};

/**
 * Hook to create a new post
 */
export const useCreatePost = (username?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ image, caption }: CreatePostInput) => {
      const formData = new FormData();
      formData.append('image', image);
      if (caption) {
        formData.append('caption', caption);
      }

      return apiUpload<CreatePostResponse>('/posts', 'POST', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
      queryClient.invalidateQueries({
        queryKey: username ? ['posts', 'user', username] : ['posts', 'user'],
      });
    },
    onError: () => {
      toast.error('Failed to create post');
    },
  });
};
