import { Grid } from 'lucide-react';

import type { UserPostItem } from '../../types/user';
import { LoadMoreButton, PostGridItem } from '../common';

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
          <PostGridItem key={post.id} post={post} onClick={onPostClick} />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <LoadMoreButton
          onLoadMore={onLoadMore}
          isLoading={isLoading ?? false}
        />
      )}
    </div>
  );
};
