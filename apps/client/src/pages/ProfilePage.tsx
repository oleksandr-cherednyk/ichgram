import { useParams } from 'react-router-dom';

import { LoadingScreen } from '../components/common';
import { ProfileGrid, ProfileHeader } from '../components/profile';
import { useFollow, useUnfollow, useUser, useUserPosts } from '../hooks';

export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();

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

  // TODO: Get actual following status from API
  // For now, we'll use a simple toggle based on mutation state
  const isFollowing = false;

  const handleFollow = () => {
    if (username) follow.mutate(username);
  };

  const handleUnfollow = () => {
    if (username) unfollow.mutate(username);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !user) {
    return <LoadingScreen message="User not found" />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <ProfileHeader
        user={user}
        isOwnProfile={false}
        isFollowing={isFollowing}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        isFollowLoading={follow.isPending || unfollow.isPending}
      />

      {/* Divider */}
      <div className="border-t border-[#DBDBDB]" />

      {/* Posts Grid */}
      <section className="py-4">
        <ProfileGrid
          posts={posts}
          onLoadMore={() => fetchNextPage()}
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
        />
      </section>
    </div>
  );
};
