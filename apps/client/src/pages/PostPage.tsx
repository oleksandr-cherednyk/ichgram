import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { LoadingScreen } from '../components/common';
import {
  EditPostModal,
  PostActionsModal,
  PostContent,
} from '../components/feed';
import { useDeletePost, usePost, useProfile } from '../hooks';

export const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading, error } = usePost(id ?? '');
  const { data: currentUser } = useProfile();
  const deletePost = useDeletePost();

  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isOwnPost = currentUser?.id === post?.author.id;

  const handleDelete = () => {
    if (!post) return;
    deletePost.mutate(post.id, { onSuccess: () => navigate('/') });
    setShowActions(false);
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setShowActions(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !post) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">Post not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-5xl px-0 py-0 md:px-4 md:py-8">
        <article className="flex flex-col md:flex-row md:h-[80vh] md:overflow-hidden rounded-[4px] border-0 md:border md:border-[#DBDBDB] bg-white">
          <PostContent post={post} onShowActions={() => setShowActions(true)} />
        </article>
      </div>

      <PostActionsModal
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        postId={post.id}
        isOwnPost={isOwnPost}
        onDelete={handleDelete}
        onEdit={handleEditStart}
      />
      {isEditing && (
        <EditPostModal isOpen onClose={() => setIsEditing(false)} post={post} />
      )}
    </>
  );
};
