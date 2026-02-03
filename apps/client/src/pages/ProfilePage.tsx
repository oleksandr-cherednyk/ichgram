import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { LoadingScreen } from '../components/common';
import {
  PostViewModal,
  ProfileGrid,
  ProfileHeader,
  ProfileSkeleton,
} from '../components/profile';
import { useFollow, useUnfollow, useUser, useUserPosts } from '../hooks';

export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const { data: user, isLoading, error } = useUser(username ?? '');
  const follow = useFollow();
  const unfollow = useUnfollow();

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserPosts(username ?? '');

  const posts = postsData?.pages.flatMap((page) => page.data) ?? [];

  const handleFollow = () => {
    if (username) follow.mutate(username);
  };

  const handleUnfollow = () => {
    if (username) unfollow.mutate(username);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !user) {
    return <LoadingScreen message="User not found" />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <ProfileHeader
        user={user}
        isOwnProfile={false}
        isFollowing={user.isFollowing}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        isFollowLoading={follow.isPending || unfollow.isPending}
      />

      {/* Posts Grid */}
      <section className="py-4">
        <ProfileGrid
          posts={posts}
          onPostClick={setSelectedPostId}
          onLoadMore={() => fetchNextPage()}
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
        />
      </section>

      {/* Post Modal */}
      <PostViewModal
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </div>
  );
};
