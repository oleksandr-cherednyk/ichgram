import { cn } from '../../lib/utils';
import type { Message } from '../../types/chat';

type MessageBubbleProps = {
  message: Message;
  isOwn: boolean;
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => (
  <div
    className={cn(
      'max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed md:max-w-[75%]',
      isOwn ? 'bg-[#4D00FF] text-white' : 'bg-[#EFEFEF] text-zinc-900',
    )}
  >
    <p className="whitespace-pre-wrap break-words">{message.text}</p>
    <span
      className={cn(
        'mt-1 block text-[11px]',
        isOwn ? 'text-white/70' : 'text-zinc-400',
      )}
    >
      {formatTime(message.createdAt)}
    </span>
  </div>
);
