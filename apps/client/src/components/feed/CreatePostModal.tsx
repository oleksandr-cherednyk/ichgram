import EmojiPicker from 'emoji-picker-react';
import { Smile } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import uploadCloudIcon from '../../assets/icons/upload-cloud.svg';
import { useCreatePost, useEmojiPicker, useProfile } from '../../hooks';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { UserAvatar } from '../ui/user-avatar';

type CreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const createPost = useCreatePost();
  const { data: user } = useProfile();

  const onEmoji = useCallback(
    (emoji: string) =>
      setCaption((prev) =>
        prev.length + emoji.length <= 200 ? prev + emoji : prev,
      ),
    [],
  );
  const {
    showEmojiPicker,
    emojiRef,
    handleEmojiClick,
    toggleEmojiPicker,
    closeEmojiPicker,
  } = useEmojiPicker({ onEmoji });

  // Generate preview URL when file selected
  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreview(null);
      setCaption('');
      closeEmojiPicker();
    }
  }, [isOpen, closeEmojiPicker]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        setSelectedFile(file);
      }
    },
    [],
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleSubmit = async () => {
    if (!selectedFile) return;

    try {
      await createPost.mutateAsync({
        image: selectedFile,
        caption: caption.trim() || undefined,
      });
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-5xl p-0"
        hideCloseButton
        aria-describedby={undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="w-16" />
          <DialogTitle className="font-semibold">Create new post</DialogTitle>
          <button
            onClick={handleSubmit}
            disabled={!preview || createPost.isPending}
            className="w-16 text-right text-sm font-semibold text-[#0095F6] hover:text-[#1aa1ff] disabled:opacity-50"
          >
            {createPost.isPending ? 'Sharing...' : 'Share'}
          </button>
        </div>
        <Separator />

        <div className="flex h-[80vh] max-h-[600px] w-full flex-col md:flex-row md:h-[60vh]">
          {/* Left side - Image */}
          <div className="flex flex-1 items-center justify-center bg-black">
            {!preview ? (
              <label
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="flex h-full w-full cursor-pointer flex-col items-center justify-center bg-[#FAFAFA]"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <img
                  src={uploadCloudIcon}
                  alt="Upload"
                  className="h-[154px] w-[154px]"
                />
              </label>
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-contain"
              />
            )}
          </div>

          {/* Right side - Info */}
          <div className="flex w-full md:w-[400px] flex-col">
            {/* User info */}
            <div className="flex items-center gap-3 px-4 pt-4">
              <UserAvatar
                src={user?.avatarUrl}
                alt={user?.username}
                size="sm"
              />
              <span className="text-sm font-semibold">{user?.username}</span>
            </div>

            {/* Caption area */}
            <div className="flex flex-1 p-4">
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                maxLength={200}
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
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width={320}
                        height={400}
                      />
                    </div>
                  )}
                </div>
                <span>{caption.length}/200</span>
              </div>

              {preview && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove image
                  </button>
                </div>
              )}

              {createPost.isError && (
                <p className="mt-2 text-center text-sm text-red-500">
                  {createPost.error.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
