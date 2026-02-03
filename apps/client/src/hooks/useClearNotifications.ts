import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';

export const useClearNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiRequest<{ ok: boolean }>('/notifications', { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.setQueryData(['notifications'], {
        pages: [{ data: [], nextCursor: null, hasMore: false }],
        pageParams: [null],
      });
      queryClient.setQueryData(['notifications', 'unread-count'], {
        count: 0,
      });
    },
  });
};
