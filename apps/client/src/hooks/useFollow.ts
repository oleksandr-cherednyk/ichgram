import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiRequest } from '../lib/api';

type FollowResponse = {
  followed: boolean;
};

type UnfollowResponse = {
  unfollowed: boolean;
};

/**
 * Hook to follow a user
 */
export const useFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) =>
      apiRequest<FollowResponse>(`/users/${username}/follow`, {
        method: 'POST',
      }),
    onSuccess: (_data, username) => {
      // Invalidate profile queries to refresh follower counts
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
    onError: () => {
      toast.error('Failed to follow user');
    },
  });
};

/**
 * Hook to unfollow a user
 */
export const useUnfollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) =>
      apiRequest<UnfollowResponse>(`/users/${username}/follow`, {
        method: 'DELETE',
      }),
    onSuccess: (_data, username) => {
      // Invalidate profile queries to refresh follower counts
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
    onError: () => {
      toast.error('Failed to unfollow user');
    },
  });
};
