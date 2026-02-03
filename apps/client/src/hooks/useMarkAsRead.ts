import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';

type MarkAsReadResponse = {
  readAt: string | null;
};

/**
 * Hook to mark a notification as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      apiRequest<MarkAsReadResponse>(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
