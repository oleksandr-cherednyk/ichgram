import { Heart, MessageCircle } from 'lucide-react';

type PostGridItemProps = {
  post: {
    id: string;
    imageUrl: string;
    likeCount: number;
    commentCount: number;
  };
  onClick?: (id: string) => void;
  className?: string;
};

export const PostGridItem = ({
  post,
  onClick,
  className = 'aspect-square',
}: PostGridItemProps) => (
  <button
    onClick={() => onClick?.(post.id)}
    className={`group relative overflow-hidden bg-zinc-100 ${className}`}
  >
    <img src={post.imageUrl} alt="" className="h-full w-full object-cover" />
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
);
