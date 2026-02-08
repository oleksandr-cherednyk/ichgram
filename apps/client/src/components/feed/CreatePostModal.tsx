import { useCallback, useEffect, useState } from 'react';

import uploadCloudIcon from '../../assets/icons/upload-cloud.svg';
import { useCreatePost, useEmojiPicker, useProfile } from '../../hooks';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { PostFormSidebar } from './PostFormSidebar';

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
                Failed to create post
              </p>
            )}
          </PostFormSidebar>
        </div>
      </DialogContent>
    </Dialog>
  );
};
