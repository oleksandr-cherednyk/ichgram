import { Trash2 } from 'lucide-react';

import {
  useConversations,
  useDeleteConversation,
  useProfile,
} from '../../hooks';
import { cn, formatTimeAgo, getOtherParticipant } from '../../lib/utils';
import { useChatStore } from '../../stores/chat';
import { Spinner } from '../ui/spinner';
import { UserAvatar } from '../ui/user-avatar';

export const ConversationList = () => {
  const { data: profile } = useProfile();
  const { activeConversationId, setActiveConversation } = useChatStore();
  const deleteConversation = useDeleteConversation();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useConversations();

  const conversations = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="flex h-full flex-col">
      {/* My username header */}
      <div className="px-5 py-4">
        <h2 className="text-lg font-bold text-[#262626]">
          {profile?.username ?? 'Messages'}
        </h2>
      </div>
      <div className="h-4" />

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <Spinner size="md" />
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-zinc-500">Failed to load conversations</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6">
          <p className="text-sm text-zinc-500">No conversations yet</p>
          <p className="text-xs text-zinc-400">
            Start a conversation to see it here
          </p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => {
              const participant = getOtherParticipant(
                conversation,
                profile?.id,
              );
              const lastMessage =
                conversation.lastMessage?.text ?? 'No messages yet';
              const timeAgo = formatTimeAgo(
                conversation.lastMessageAt ?? conversation.createdAt,
              );

              return (
                <div
                  key={conversation.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveConversation(conversation.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveConversation(conversation.id);
                    }
                  }}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50',
                    activeConversationId === conversation.id && 'bg-zinc-50',
                  )}
                >
                  <UserAvatar
                    src={participant?.avatarUrl}
                    alt={participant?.username}
                    size="xl"
                  />

                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-[#262626]">
                        {participant?.username ?? 'Unknown'}
                      </span>
                      <div className="flex items-center gap-2">
                        {timeAgo && (
                          <span className="text-xs text-zinc-400">
                            {timeAgo}
                          </span>
                        )}
                        {conversation.unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                            {conversation.unreadCount > 99
                              ? '99+'
                              : conversation.unreadCount}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            const confirmed = window.confirm(
                              'Delete this conversation for you?',
                            );
                            if (!confirmed) return;
                            deleteConversation.mutate({
                              conversationId: conversation.id,
                            });
                          }}
                          className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500"
                          aria-label="Delete conversation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <span className="truncate text-sm text-zinc-400">
                      {lastMessage}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {hasNextPage && (
            <div className="border-t border-zinc-100 p-4">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full text-sm text-[#0095F6] hover:text-[#1aa1ff] disabled:opacity-50"
              >
                {isFetchingNextPage ? <Spinner size="sm" /> : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
