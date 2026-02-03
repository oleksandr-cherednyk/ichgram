import { Heart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  useComments,
  useDeleteComment,
  useProfile,
  useToggleCommentLike,
} from '../../hooks';
import { formatTimeAgo } from '../../lib/utils';
import type { Comment } from '../../types/post';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Spinner } from '../ui/spinner';
import { UserAvatar } from '../ui/user-avatar';

type CommentsSectionProps = {
  postId: string;
  onLinkClick?: () => void;
};

type CommentItemProps = {
  comment: Comment;
  currentUserId?: string;
  postId: string;
  onLinkClick?: () => void;
};

const CommentItem = ({
  comment,
  currentUserId,
  postId,
  onLinkClick,
}: CommentItemProps) => {
  const deleteComment = useDeleteComment();
  const toggleLike = useToggleCommentLike();
  const isAuthor = currentUserId === comment.authorId;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    deleteComment.mutate({ postId, commentId: comment.id });
    setShowDeleteDialog(false);
  };

  const handleToggleLike = () => {
    toggleLike.mutate({
      postId,
      commentId: comment.id,
      isLiked: comment.isLiked,
    });
  };

  return (
    <div className="group flex gap-3">
      <Link to={`/profile/${comment.author.username}`} onClick={onLinkClick}>
        <UserAvatar
          src={comment.author.avatarUrl}
          alt={comment.author.username}
          size="sm"
        />
      </Link>
      <div className="flex-1">
        <p className="text-sm">
          <Link
            to={`/profile/${comment.author.username}`}
            onClick={onLinkClick}
            className="mr-1 font-semibold hover:underline"
          >
            {comment.author.username}
          </Link>
          {comment.text}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
          <span>{formatTimeAgo(comment.createdAt)}</span>
          {comment.likeCount > 0 && (
            <span>
              {comment.likeCount} {comment.likeCount === 1 ? 'like' : 'likes'}
            </span>
          )}
          {isAuthor && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteComment.isPending}
              className="opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      <button
        onClick={handleToggleLike}
        className="mt-1 flex-shrink-0 self-start"
        aria-label={comment.isLiked ? 'Unlike comment' : 'Like comment'}
      >
        <Heart
          className={`h-3 w-3 ${
            comment.isLiked
              ? 'fill-red-500 text-red-500'
              : 'text-[#262626] hover:text-zinc-500'
          }`}
        />
      </button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const CommentsSection = ({
  postId,
  onLinkClick,
}: CommentsSectionProps) => {
  const { data: currentUser } = useProfile();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useComments(postId);

  const comments = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="flex flex-col">
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-zinc-400">No comments yet</p>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUser?.id}
                postId={postId}
                onLinkClick={onLinkClick}
              />
            ))}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="text-sm text-zinc-400 hover:text-zinc-600"
              >
                {isFetchingNextPage ? (
                  <Spinner size="sm" />
                ) : (
                  'Load more comments'
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
