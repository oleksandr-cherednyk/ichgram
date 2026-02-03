import { Compass } from 'lucide-react';
import { useState } from 'react';

import { PostGridItem } from '../components/common';
import { PostViewModal } from '../components/profile';
import { Skeleton } from '../components/ui/skeleton';
import { useExplorePosts } from '../hooks';

/**
 * Grid position config for 4×3 explore layout.
 * Posts #3 (index 2) and #6 (index 5) span 2 rows.
 *
 * Layout:
 *  1   2   3
 *  4   5   3  ← post 3 spans rows 1-2, col 3
 *  6   7   8
 *  6   9  10  ← post 6 spans rows 3-4, col 1
 */
const TALL_INDICES = new Set([2, 5]);

export const ExplorePage = () => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const { data: posts, isLoading, error } = useExplorePosts();

  if (isLoading) {
    return (
      <div className="flex justify-center px-1 py-8">
        <div className="grid w-full max-w-[950px] grid-cols-3 gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`rounded-none ${TALL_INDICES.has(i) ? 'row-span-2' : 'aspect-square'}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
        <Compass className="mb-4 h-12 w-12" />
        <p className="text-lg font-semibold">No posts to explore</p>
        <p className="text-sm">Check back later for new content</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-1 py-8">
      {/* Posts Grid */}
      <div className="grid w-full max-w-[950px] grid-cols-3 gap-1">
        {posts.slice(0, 10).map((post, i) => (
          <PostGridItem
            key={post.id}
            post={post}
            onClick={setSelectedPostId}
            className={TALL_INDICES.has(i) ? 'row-span-2' : 'aspect-square'}
          />
        ))}
      </div>

      {/* Post Modal */}
      <PostViewModal
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </div>
  );
};
