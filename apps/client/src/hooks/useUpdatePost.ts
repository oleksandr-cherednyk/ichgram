import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiUpload } from '../lib/api';

type UpdatePostParams = {
  postId: string;
  caption?: string;
  image?: File;
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, caption, image }: UpdatePostParams) => {
      const formData = new FormData();
      if (caption !== undefined) {
        formData.append('caption', caption);
      }
      if (image) {
        formData.append('image', image);
      }

      return apiUpload(`/posts/${postId}`, 'PATCH', formData);
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post updated');
    },
    onError: () => {
      toast.error('Failed to update post');
    },
  });
};
