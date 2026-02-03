import { useState } from 'react';

import { useDeletePost, usePost, useProfile } from '../../hooks';
import type { FeedPost } from '../../types/post';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Spinner } from '../ui/spinner';
import { EditPostModal } from './EditPostModal';
import { PostActionsModal } from './PostActionsModal';
import { PostContent } from './PostContent';

type PostDetailModalProps = {
  post?: FeedPost | null;
  postId?: string | null;
  onClose: () => void;
};

export const PostDetailModal = ({
  post: providedPost,
  postId: providedPostId,
  onClose,
}: PostDetailModalProps) => {
  const resolvedPostId = providedPost?.id ?? providedPostId;
  const isOpen = !!resolvedPostId;

  const { data: fetchedPostData, isLoading } = usePost(resolvedPostId ?? '');
  const post = fetchedPostData ?? providedPost ?? null;
  const needsLoading = !post && isLoading;

  const { data: currentUser } = useProfile();
  const deletePost = useDeletePost();

  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isOwnPost = currentUser?.id === post?.author.id;

  const handleDelete = () => {
    if (!post) return;
    deletePost.mutate(post.id, { onSuccess: () => onClose() });
    setShowActions(false);
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setShowActions(false);
  };

  return (
    <>
      <Dialog
        open={isOpen && !isEditing}
        onOpenChange={(open) => !open && onClose()}
      >
        <DialogContent
          className="left-0 right-0 top-0 bottom-14 max-w-none translate-x-0 translate-y-0 rounded-none p-0 md:inset-auto md:bottom-auto md:left-[50%] md:top-[50%] md:max-w-5xl md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-[4px]"
          hideCloseButton
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Post details</DialogTitle>
          <div className="flex h-full w-full flex-col overflow-y-auto md:h-[80vh] md:flex-row md:overflow-hidden">
            {needsLoading || !post ? (
              <div className="flex w-full items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : (
              <PostContent
                post={post}
                onLinkClick={onClose}
                onShowActions={() => setShowActions(true)}
              />
            )}
          </div>
        </DialogContent>
        {post && (
          <PostActionsModal
            isOpen={showActions}
            onClose={() => setShowActions(false)}
            postId={post.id}
            isOwnPost={isOwnPost}
            onDelete={handleDelete}
            onEdit={handleEditStart}
          />
        )}
      </Dialog>
      {post && isEditing && (
        <EditPostModal
          isOpen
          onClose={() => {
            setIsEditing(false);
            onClose();
          }}
          post={post}
        />
      )}
    </>
  );
};
