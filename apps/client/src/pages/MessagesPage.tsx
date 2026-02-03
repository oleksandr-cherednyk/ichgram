import { ChatView, ConversationList } from '../components/chat';
import { cn } from '../lib/utils';
import { useChatStore } from '../stores/chat';

export const MessagesPage = () => {
  const { activeConversationId, setActiveConversation } = useChatStore();

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden md:flex-row">
      {/* Left panel - conversation list */}
      <div
        className={cn(
          'h-full overflow-hidden md:w-80 md:border-r md:border-zinc-200',
          activeConversationId ? 'hidden md:block' : 'block',
        )}
      >
        <ConversationList />
      </div>

      {/* Right panel - chat */}
      <div
        className={cn(
          'min-h-0 flex-1 overflow-hidden',
          activeConversationId ? 'flex' : 'hidden md:flex',
        )}
      >
        {activeConversationId ? (
          <ChatView
            conversationId={activeConversationId}
            onBack={() => setActiveConversation(null)}
          />
        ) : (
          <div className="hidden h-full flex-1 flex-col items-center justify-center gap-2 md:flex">
            <p className="text-sm text-zinc-500">Select a conversation</p>
            <p className="text-xs text-zinc-400">
              Choose a chat to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
