import { ArrowLeft } from 'lucide-react';

import { UserAvatar } from '../ui/user-avatar';

type ChatHeaderProps = {
  username?: string;
  avatarUrl?: string | null;
  onBack: () => void;
};

export const ChatHeader = ({
  username,
  avatarUrl,
  onBack,
}: ChatHeaderProps) => (
  <div className="flex flex-shrink-0 items-center gap-3 border-b border-zinc-200 px-4 py-3">
    <button
      onClick={onBack}
      className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 md:hidden"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>

    <UserAvatar
      src={avatarUrl}
      alt={username}
      size="sm"
      className="md:h-10 md:w-10"
    />

    <span className="truncate text-sm font-bold text-[#262626]">
      {username ?? 'Conversation'}
    </span>
  </div>
);
