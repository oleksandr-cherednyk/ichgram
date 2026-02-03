import { useState } from 'react';

import okIcon from '../assets/ok-icon.svg';
import {
  FeedCard,
  PostCardSkeleton,
  PostDetailModal,
} from '../components/feed';
import { LoadMoreButton } from '../components/common';
import { useFeedPosts } from '../hooks';
import type { HomeFeedPost } from '../types/post';

export const FeedPage = () => {
  const [selectedPost, setSelectedPost] = useState<HomeFeedPost | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useFeedPosts();

  const posts = (data?.pages.flatMap((page) => page.data) ?? []).slice(0, 6);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg py-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Failed to load feed</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2">
        <p className="text-zinc-500">No posts yet</p>
        <p className="text-sm text-zinc-400">
          Follow people to see their posts here
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[816px] px-2 py-4 md:px-0">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <FeedCard key={post.id} post={post} onOpenPost={setSelectedPost} />
        ))}
      </div>

      {hasNextPage ? (
        <LoadMoreButton
          onLoadMore={() => fetchNextPage()}
          isLoading={isFetchingNextPage}
        />
      ) : (
        <div className="flex flex-col items-center gap-3 py-12">
          <img src={okIcon} alt="" className="h-[84px] w-[84px]" />
          <p className="text-base font-semibold">You've seen all the updates</p>
          <p className="text-sm text-zinc-400">
            You have viewed all new publications
          </p>
        </div>
      )}

      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
};
