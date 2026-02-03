import type { EmojiClickData } from 'emoji-picker-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type UseEmojiPickerOptions = {
  onEmoji: (emoji: string) => void;
};

export const useEmojiPicker = ({ onEmoji }: UseEmojiPickerOptions) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmoji(emojiData.emoji);
  };

  const toggleEmojiPicker = useCallback(
    () => setShowEmojiPicker((prev) => !prev),
    [],
  );

  const closeEmojiPicker = useCallback(() => setShowEmojiPicker(false), []);

  return {
    showEmojiPicker,
    emojiRef,
    handleEmojiClick,
    toggleEmojiPicker,
    closeEmojiPicker,
  };
};
