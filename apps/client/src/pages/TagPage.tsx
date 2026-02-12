import { Hash } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  LoadingScreen,
  LoadMoreButton,
  PostGridItem,
} from '../components/common';
import { PostDetailModal } from '../components/feed';
import { useTagPosts } from '../hooks';

export const TagPage = () => {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const tags = (tag ?? '').split('+').filter(Boolean);

  const handleTagSearch = (e: FormEvent) => {
    e.preventDefault();
    const parsed = tagInput
      .split(/[\s,]+/)
      .map((t) => t.replace(/^#/, '').toLowerCase().trim())
      .filter(Boolean);
    if (parsed.length) {
      navigate(`/tags/${parsed.join('+')}`);
      setTagInput('');
    }
  };

  const hasTag = tags.length > 0;

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

  if (hasTag && isLoading) {
    return <LoadingScreen />;
  }

  if (hasTag && error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">Failed to load posts</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <header className="mb-4">
        <h1 className="min-h-[2rem] text-2xl font-bold md:min-h-[2.25rem] md:text-3xl">
          {hasTag ? tags.map((t) => `#${t}`).join(' ') : '\u00A0'}
        </h1>

        <div className="mt-4 flex items-end justify-between">
          <form onSubmit={handleTagSearch}>
            <label
              htmlFor="tag-search"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Search by tag
            </label>
            <div className="flex gap-2">
              <input
                id="tag-search"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="#nature #photo"
                className="w-full max-w-xs rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-400"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#0095F6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1aa1ff] disabled:opacity-50"
                disabled={!tagInput.trim()}
              >
                Search
              </button>
            </div>
          </form>
          {hasTag && (
            <span className="text-sm text-zinc-500">
              {totalCount.toLocaleString()}{' '}
              {totalCount === 1 ? 'post' : 'posts'}
            </span>
          )}
        </div>
      </header>

      {/* Posts Grid */}
      {!hasTag ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
          <Hash className="mb-4 h-12 w-12" />
          <p className="text-lg font-semibold">Search for tags</p>
          <p className="text-sm">Enter one or more hashtags above</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
          <Hash className="mb-4 h-12 w-12" />
          <p className="text-lg font-semibold">No posts yet</p>
          <p className="text-sm">
            Be the first to use {tags.map((t) => `#${t}`).join(' ')}
          </p>
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
