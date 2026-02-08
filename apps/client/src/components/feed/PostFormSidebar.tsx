import { Smile } from 'lucide-react';
import { lazy, Suspense, type RefObject } from 'react';

const EmojiPicker = lazy(() => import('emoji-picker-react'));

import type { EmojiClickData } from 'emoji-picker-react';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { UserAvatar } from '../ui/user-avatar';

type PostFormSidebarProps = {
  username?: string;
  avatarUrl?: string | null;
  caption: string;
  onCaptionChange: (value: string) => void;
  maxLength: number;
  showEmojiPicker: boolean;
  toggleEmojiPicker: () => void;
  handleEmojiClick: (emojiData: EmojiClickData) => void;
  emojiRef: RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
};

export const PostFormSidebar = ({
  username,
  avatarUrl,
  caption,
  onCaptionChange,
  maxLength,
  showEmojiPicker,
  toggleEmojiPicker,
  handleEmojiClick,
  emojiRef,
  children,
}: PostFormSidebarProps) => (
  <div className="flex w-full md:w-[400px] flex-col">
    {/* User info */}
    <div className="flex items-center gap-3 px-4 pt-4">
      <UserAvatar src={avatarUrl} alt={username} size="sm" />
      <span className="text-sm font-semibold">{username}</span>
    </div>

    {/* Caption area */}
    <div className="flex flex-1 p-4">
      <Textarea
        value={caption}
        onChange={(e) => onCaptionChange(e.target.value)}
        placeholder="Write a caption..."
        maxLength={maxLength}
        className="h-full resize-none border-none p-0 focus-visible:ring-0"
      />
    </div>

    {/* Footer */}
    <Separator />
    <div className="p-4">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <div className="relative" ref={emojiRef}>
          <button
            type="button"
            onClick={toggleEmojiPicker}
            className="text-zinc-400 transition-colors hover:text-zinc-600"
          >
            <Smile className="h-5 w-5" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-8 left-0 z-50">
              <Suspense fallback={null}>
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width={320}
                  height={400}
                />
              </Suspense>
            </div>
          )}
        </div>
        <span>
          {caption.length}/{maxLength}
        </span>
      </div>

      {children}
    </div>
  </div>
);
