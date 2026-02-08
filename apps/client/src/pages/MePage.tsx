import { useState } from 'react';

import { PostDetailModal } from '../components/feed';
import {
  ProfileGrid,
  ProfileHeader,
  ProfileSkeleton,
} from '../components/profile';
import { useLogout, useProfile, useUserPosts } from '../hooks';

export const MePage = () => {
  const logout = useLogout();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const { data: user, isLoading, error } = useProfile();

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserPosts(user?.username ?? '');

  const posts = postsData?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !user) {
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
    <div className="mx-auto max-w-4xl px-4 py-8">
      <ProfileHeader user={user} isOwnProfile={true} />

      <section className="py-4">
        <ProfileGrid
          posts={posts}
          onPostClick={setSelectedPostId}
          onLoadMore={() => fetchNextPage()}
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
        />
      </section>

      <PostDetailModal
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </div>
  );
};
