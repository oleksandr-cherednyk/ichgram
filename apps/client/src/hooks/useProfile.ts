import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';
import type { UpdateProfileInput, UserProfile } from '../types/user';

type ProfileResponse = {
  user: UserProfile;
};

/**
 * Hook to get current user's profile
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => apiRequest<ProfileResponse>('/users/me'),
    select: (data) => data.user,
  });
};

/**
 * Hook to get user profile by username
 */
export const useUser = (username: string) => {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => apiRequest<ProfileResponse>(`/users/${username}`),
    select: (data) => data.user,
    enabled: !!username,
  });
};

/**
 * Hook to update current user's profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      apiRequest<ProfileResponse>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', 'me'], data);
      queryClient.setQueryData(['profile', data.user.username], data);
    },
  });
};
