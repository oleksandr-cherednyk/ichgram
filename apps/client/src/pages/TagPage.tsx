import { Hash } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  LoadingScreen,
  LoadMoreButton,
  PostGridItem,
} from '../components/common';
import { PostDetailModal } from '../components/feed';
import { useTagPosts } from '../hooks';

export const TagPage = () => {
  const { tag } = useParams<{ tag: string }>();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useTagPosts(tag ?? '');

  const posts = postsData?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = postsData?.pages[0]?.totalCount ?? 0;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">Failed to load posts</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <header className="mb-8 flex items-center gap-6">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-2 border-zinc-200 bg-zinc-50 md:h-36 md:w-36">
          <Hash className="h-8 w-8 text-zinc-600 md:h-12 md:w-12" />
        </div>
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">#{tag}</h1>
          <p className="mt-1 text-zinc-500">
            {totalCount.toLocaleString()} {totalCount === 1 ? 'post' : 'posts'}
          </p>
        </div>
      </header>

      {/* Divider */}
      <div className="border-t border-[#DBDBDB]" />

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
          <Hash className="mb-4 h-12 w-12" />
          <p className="text-lg font-semibold">No posts yet</p>
          <p className="text-sm">Be the first to use #{tag}</p>
        </div>
      ) : (
        <>
          <section className="py-4">
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <PostGridItem
                  key={post.id}
                  post={post}
                  onClick={setSelectedPostId}
                />
              ))}
            </div>
          </section>

          {hasNextPage && (
            <LoadMoreButton
              onLoadMore={() => fetchNextPage()}
              isLoading={isFetchingNextPage}
            />
          )}
        </>
      )}

      {/* Post Modal */}
      <PostDetailModal
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </div>
  );
};
