import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiRequest } from '../lib/api';
import type { MessagesResponse, SendMessageResponse } from '../types/chat';

type SendMessageParams = {
  conversationId: string;
  text: string;
};

/**
 * Hook to send a message in a conversation
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, text }: SendMessageParams) =>
      apiRequest<SendMessageResponse>(
        `/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ text }),
        },
      ),
    onSuccess: (data, { conversationId }) => {
      queryClient.setQueryData<{
        pages: MessagesResponse[];
        pageParams: (string | null)[];
      }>(['messages', conversationId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page, index) =>
            index === 0
              ? { ...page, data: [data.message, ...page.data] }
              : page,
          ),
        };
      });

      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });
};
