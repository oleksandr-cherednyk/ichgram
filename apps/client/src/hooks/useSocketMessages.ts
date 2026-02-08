import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { getSocket } from '../lib/socket';
import { useChatStore } from '../stores/chat';
import { useMarkConversationRead } from './useMarkConversationRead';
import type {
  Message,
  MessagesResponse,
  ConversationsResponse,
  UnreadMessageCountResponse,
} from '../types/chat';

export const useSocketMessages = () => {
  const queryClient = useQueryClient();
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );
  const setActiveConversation = useChatStore(
    (state) => state.setActiveConversation,
  );
  const markConversationRead = useMarkConversationRead();
  const markReadRef = useRef(markConversationRead);
  markReadRef.current = markConversationRead;

  useEffect(() => {
    const socket = getSocket();

    const handleMessage = (payload: { message: Message }) => {
      const { message } = payload;

      queryClient.setQueryData<{
        pages: MessagesResponse[];
        pageParams: (string | null)[];
      }>(['messages', message.conversationId], (old) => {
        if (!old) return undefined;

        return {
          ...old,
          pages: old.pages.map((page, index) =>
            index === 0 ? { ...page, data: [message, ...page.data] } : page,
          ),
        };
      });

      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread-count'] });

      if (activeConversationId === message.conversationId) {
        markReadRef.current.mutate({ conversationId: message.conversationId });
        queryClient.setQueryData<{
          pages: ConversationsResponse[];
          pageParams: (string | null)[];
        }>(['conversations'], (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((conversation) =>
                conversation.id === message.conversationId
                  ? { ...conversation, unreadCount: 0 }
                  : conversation,
              ),
            })),
          };
        });
        return;
      }

      queryClient.setQueryData<UnreadMessageCountResponse>(
        ['messages', 'unread-count'],
        (old) => ({ count: (old?.count ?? 0) + 1 }),
      );

      queryClient.setQueryData<{
        pages: ConversationsResponse[];
        pageParams: (string | null)[];
      }>(['conversations'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((conversation) =>
              conversation.id === message.conversationId
                ? {
                    ...conversation,
                    unreadCount: (conversation.unreadCount ?? 0) + 1,
                  }
                : conversation,
            ),
          })),
        };
      });
    };

    const handleConversationDeleted = (payload: { conversationId: string }) => {
      const { conversationId } = payload;

      const existing = queryClient.getQueryData<{
        pages: ConversationsResponse[];
        pageParams: (string | null)[];
      }>(['conversations']);

      const removedUnread =
        existing?.pages
          .flatMap((page) => page.data)
          .find((conversation) => conversation.id === conversationId)
          ?.unreadCount ?? 0;

      queryClient.setQueryData<{
        pages: ConversationsResponse[];
        pageParams: (string | null)[];
      }>(['conversations'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter(
              (conversation) => conversation.id !== conversationId,
            ),
          })),
        };
      });

      if (removedUnread > 0) {
        queryClient.setQueryData<UnreadMessageCountResponse>(
          ['messages', 'unread-count'],
          (old) => ({ count: Math.max(0, (old?.count ?? 0) - removedUnread) }),
        );
      }

      queryClient.removeQueries({ queryKey: ['messages', conversationId] });

      if (activeConversationId === conversationId) {
        setActiveConversation(null);
      }
    };

    socket.on('message:new', handleMessage);
    socket.on('conversation:deleted', handleConversationDeleted);

    return () => {
      socket.off('message:new', handleMessage);
      socket.off('conversation:deleted', handleConversationDeleted);
    };
  }, [activeConversationId, queryClient, setActiveConversation]);
};
