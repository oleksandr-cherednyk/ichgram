import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';
import { useChatStore } from '../stores/chat';

type DeleteConversationResponse = void;

/**
 * Hook to delete a conversation
 */
export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );
  const setActiveConversation = useChatStore(
    (state) => state.setActiveConversation,
  );

  return useMutation({
    mutationFn: ({ conversationId }: { conversationId: string }) =>
      apiRequest<DeleteConversationResponse>(
        `/conversations/${conversationId}`,
        { method: 'DELETE' },
      ),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread-count'] });
      queryClient.removeQueries({ queryKey: ['messages', conversationId] });
      if (activeConversationId === conversationId) {
        setActiveConversation(null);
      }
    },
  });
};
