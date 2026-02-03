import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';

type MarkConversationReadResponse = {
  ok: boolean;
};

/**
 * Hook to mark a conversation as read
 */
export const useMarkConversationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId }: { conversationId: string }) =>
      apiRequest<MarkConversationReadResponse>(
        `/conversations/${conversationId}/read`,
        { method: 'PATCH' },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread-count'] });
    },
  });
};
