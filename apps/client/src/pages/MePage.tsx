import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  PostViewModal,
  ProfileGrid,
  ProfileHeader,
  ProfileSkeleton,
} from '../components/profile';
import { useProfile, useUserPosts } from '../hooks';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../stores/auth';

export const MePage = () => {
  const navigate = useNavigate();
  const { clear } = useAuthStore();
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
          onClick={async () => {
            await apiRequest('/auth/logout', { method: 'POST' });
            clear();
            navigate('/login');
          }}
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

      <PostViewModal
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </div>
  );
};
