import { Smile } from 'lucide-react';
import { lazy, Suspense, useCallback, useState } from 'react';

const EmojiPicker = lazy(() => import('emoji-picker-react'));

import { useCreateComment, useEmojiPicker } from '../../hooks';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type CommentInputProps = {
  postId: string;
};

export const CommentInput = ({ postId }: CommentInputProps) => {
  const [commentText, setCommentText] = useState('');
  const createComment = useCreateComment();

  const onEmoji = useCallback(
    (emoji: string) => setCommentText((prev) => prev + emoji),
    [],
  );
  const { showEmojiPicker, emojiRef, handleEmojiClick, toggleEmojiPicker } =
    useEmojiPicker({ onEmoji });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    createComment.mutate(
      { postId, text: commentText.trim() },
      { onSuccess: () => setCommentText('') },
    );
  };

  return (
    <>
      <Separator />
      <form
        onSubmit={handleSubmitComment}
        className="flex items-center gap-3 px-4 py-3"
      >
        <div className="relative flex items-center" ref={emojiRef}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleEmojiPicker}
                className="text-[#262626] transition-colors hover:text-zinc-600"
              >
                <Smile className="h-6 w-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Emoji</TooltipContent>
          </Tooltip>
          {showEmojiPicker && (
            <div className="absolute bottom-10 left-0 z-50">
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
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          maxLength={500}
          className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />
        <button
          type="submit"
          disabled={!commentText.trim() || createComment.isPending}
          className="text-sm font-semibold text-[#0095F6] disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </>
  );
};
