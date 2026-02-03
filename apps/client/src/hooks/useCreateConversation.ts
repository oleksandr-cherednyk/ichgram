import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';
import type { CreateConversationResponse } from '../types/chat';

type CreateConversationParams = {
  participantId: string;
};

/**
 * Hook to create or find a conversation
 */
export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ participantId }: CreateConversationParams) =>
      apiRequest<CreateConversationResponse>('/conversations', {
        method: 'POST',
        body: JSON.stringify({ participantId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
