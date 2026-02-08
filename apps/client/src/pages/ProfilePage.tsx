import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { PostDetailModal } from '../components/feed';
import {
  ProfileGrid,
  ProfileHeader,
  ProfileSkeleton,
} from '../components/profile';
import {
  useFollow,
  useLogout,
  useProfile,
  useUnfollow,
  useUser,
  useUserPosts,
} from '../hooks';

export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const isOwnProfile = !username;

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const profileQuery = useProfile();
  const userQuery = useUser(username ?? '');
  const logout = useLogout();
  const follow = useFollow();
  const unfollow = useUnfollow();

  const {
    data: user,
    isLoading,
    error,
  } = isOwnProfile ? profileQuery : userQuery;

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserPosts(user?.username ?? '');

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
    if (isOwnProfile) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-zinc-500">Failed to load profile</p>
          <button
            onClick={logout}
            className="text-sm text-[#0095F6] hover:underline"
          >
            Log out
          </button>
        </div>
      );
    }

    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        isFollowing={!isOwnProfile ? user.isFollowing : undefined}
        onFollow={!isOwnProfile ? handleFollow : undefined}
        onUnfollow={!isOwnProfile ? handleUnfollow : undefined}
        isFollowLoading={
          !isOwnProfile ? follow.isPending || unfollow.isPending : undefined
        }
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
      <PostDetailModal
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </div>
  );
};
