import { ImagePlus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { useEmojiPicker, useProfile, useUpdatePost } from '../../hooks';
import type { FeedPost } from '../../types/post';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { PostFormSidebar } from './PostFormSidebar';

type EditPostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  post: FeedPost;
};

export const EditPostModal = ({
  isOpen,
  onClose,
  post,
}: EditPostModalProps) => {
  const [caption, setCaption] = useState(post.caption ?? '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const updatePost = useUpdatePost();
  const { data: user } = useProfile();

  const onEmoji = useCallback(
    (emoji: string) =>
      setCaption((prev) =>
        prev.length + emoji.length <= 200 ? prev + emoji : prev,
      ),
    [],
  );
  const { showEmojiPicker, emojiRef, handleEmojiClick, toggleEmojiPicker } =
    useEmojiPicker({ onEmoji });

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

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        setSelectedFile(file);
      }
    },
    [],
  );

  const handleSubmit = async () => {
    try {
      await updatePost.mutateAsync({
        postId: post.id,
        caption: caption.trim(),
        image: selectedFile ?? undefined,
      });
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  const displayImage = preview ?? post.imageUrl;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-5xl p-0"
        hideCloseButton
        aria-describedby={undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onClose}
            className="w-16 text-left text-sm font-semibold"
          >
            Cancel
          </button>
          <DialogTitle className="font-semibold">Edit post</DialogTitle>
          <button
            onClick={handleSubmit}
            disabled={updatePost.isPending}
            className="w-16 text-right text-sm font-semibold text-[#0095F6] hover:text-[#1aa1ff] disabled:opacity-50"
          >
            {updatePost.isPending ? 'Saving...' : 'Done'}
          </button>
        </div>
        <Separator />

        <div className="flex h-[80vh] max-h-[600px] w-full flex-col md:flex-row md:h-[60vh]">
          {/* Left side - Image */}
          <label className="relative flex flex-1 cursor-pointer items-center justify-center bg-black">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <img
              src={displayImage}
              alt={post.caption || 'Post image'}
              className="h-full w-full object-contain"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
              <ImagePlus className="h-12 w-12 text-white/70" />
            </div>
          </label>

          {/* Right side - Info */}
          <PostFormSidebar
            username={user?.username}
            avatarUrl={user?.avatarUrl}
            caption={caption}
            onCaptionChange={setCaption}
            maxLength={200}
            showEmojiPicker={showEmojiPicker}
            toggleEmojiPicker={toggleEmojiPicker}
            handleEmojiClick={handleEmojiClick}
            emojiRef={emojiRef}
          >
            {updatePost.isError && (
              <p className="mt-2 text-center text-sm text-red-500">
                Failed to update post
              </p>
            )}
          </PostFormSidebar>
        </div>
      </DialogContent>
    </Dialog>
  );
};
