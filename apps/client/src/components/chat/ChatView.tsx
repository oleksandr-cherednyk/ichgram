import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';

import {
  useConversations,
  useMarkConversationRead,
  useMessages,
  useProfile,
} from '../../hooks';
import { getOtherParticipant } from '../../lib/utils';
import { useChatStore } from '../../stores/chat';
import { Spinner } from '../ui/spinner';
import { UserAvatar } from '../ui/user-avatar';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';

type ChatViewProps = {
  conversationId: string;
  onBack?: () => void;
};

const formatChatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ChatView = ({ conversationId, onBack }: ChatViewProps) => {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { setActiveConversation } = useChatStore();
  const { data: conversationData } = useConversations();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useMessages(conversationId);
  const { mutate: markRead } = useMarkConversationRead();

  const conversations =
    conversationData?.pages.flatMap((page) => page.data) ?? [];
  const conversation = conversations.find((item) => item.id === conversationId);
  const participant = conversation
    ? getOtherParticipant(conversation, profile?.id)
    : null;

  const orderedMessages = useMemo(
    () => (data?.pages.flatMap((page) => page.data) ?? []).reverse(),
    [data],
  );

  useEffect(() => {
    markRead({ conversationId });
  }, [conversationId, markRead]);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    setActiveConversation(null);
  };

  const header = (
    <div className="flex flex-col items-center py-6 md:py-8">
      {/* Participant avatar */}
      <UserAvatar
        src={participant?.avatarUrl}
        alt={participant?.username}
        size="xl"
        className="md:h-20 md:w-20"
      />

      {/* Username */}
      <p className="mt-3 text-sm font-bold text-[#262626]">
        {participant?.username ?? 'Unknown'}
      </p>

      {/* View profile */}
      {participant && (
        <button
          type="button"
          onClick={() => navigate(`/profile/${participant.username}`)}
          className="mt-2 rounded-lg bg-zinc-100 px-4 py-1.5 text-sm font-semibold text-[#262626] transition hover:bg-zinc-200"
        >
          View profile
        </button>
      )}

      {/* Chat creation date */}
      {conversation && (
        <p className="mt-6 text-xs text-zinc-400">
          {formatChatDate(conversation.createdAt)}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {/* Chat header */}
      <ChatHeader
        username={participant?.username}
        avatarUrl={participant?.avatarUrl}
        onBack={handleBack}
      />

      {/* Messages area */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : (
          <Virtuoso
            data={orderedMessages}
            className="h-full"
            followOutput="smooth"
            startReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            components={{
              Header: () => header,
            }}
            itemContent={(_, message) => {
              const isOwn = message.senderId === profile?.id;
              const avatarUrl = isOwn
                ? profile?.avatarUrl
                : participant?.avatarUrl;
              const avatarAlt = isOwn
                ? profile?.username
                : participant?.username;

              return (
                <div className="px-3 py-1 md:px-4">
                  <div
                    className={`flex items-start gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    <UserAvatar
                      src={avatarUrl}
                      alt={avatarAlt}
                      size="xs"
                      className="mt-0.5 h-7 w-7"
                    />
                    <MessageBubble message={message} isOwn={isOwn} />
                  </div>
                </div>
              );
            }}
          />
        )}
      </div>

      {/* Message input */}
      <ChatInput conversationId={conversationId} />
    </div>
  );
};
