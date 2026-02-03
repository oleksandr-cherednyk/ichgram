import { Heart } from 'lucide-react';

import { useTogglePostLike } from '../../hooks';

type LikeButtonProps = {
  postId: string;
  isLiked: boolean;
  className?: string;
};

export const LikeButton = ({
  postId,
  isLiked,
  className = '',
}: LikeButtonProps) => {
  const toggleLike = useTogglePostLike();

  const handleClick = () => {
    if (toggleLike.isPending) return;
    toggleLike.mutate({ postId, isLiked });
  };

  return (
    <button
      onClick={handleClick}
      disabled={toggleLike.isPending}
      className={`transition-colors hover:text-zinc-500 disabled:opacity-50 ${className}`}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <Heart
        className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
      />
    </button>
  );
};
