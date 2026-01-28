import { Grid, Heart, MessageCircle } from 'lucide-react';

import type { UserPostItem } from '../../types/user';

type ProfileGridProps = {
  posts: UserPostItem[];
  onPostClick?: (postId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
};

export const ProfileGrid = ({
  posts,
  onPostClick,
  onLoadMore,
  hasMore,
  isLoading,
}: ProfileGridProps) => {
  if (posts.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
        <Grid className="h-12 w-12 mb-4" />
        <p className="text-lg font-semibold">No posts yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => onPostClick?.(post.id)}
            className="group relative aspect-square overflow-hidden bg-zinc-100"
          >
            <img
              src={post.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="flex items-center gap-2 font-semibold text-white">
                <Heart className="h-5 w-5 fill-white" />
                {post.likeCount}
              </span>
              <span className="flex items-center gap-2 font-semibold text-white">
                <MessageCircle className="h-5 w-5 fill-white" />
                {post.commentCount}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center py-8">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-sm text-[#0095F6] hover:text-[#1aa1ff] disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
};
