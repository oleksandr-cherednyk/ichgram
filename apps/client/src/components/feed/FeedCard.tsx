import { Heart, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { formatTimeAgo } from '../../lib/utils';
import type { HomeFeedPost } from '../../types/post';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { UserAvatar } from '../ui/user-avatar';

type FeedCardProps = {
  post: HomeFeedPost;
  onOpenPost: (post: HomeFeedPost) => void;
};

export const FeedCard = ({ post, onOpenPost }: FeedCardProps) => {
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const captionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = captionRef.current;
    if (el) {
      setIsClamped(el.scrollHeight > el.clientHeight);
    }
  }, [post.caption]);
  return (
    <Card className="overflow-hidden rounded-none border-x-0 border-t-0 border-b border-[#DBDBDB] bg-white shadow-none">
      {/* Header: avatar, username, time, follow link */}
      <CardHeader className="flex-row items-center gap-2 space-y-0 px-0 py-3">
        <Link
          to={`/profile/${post.author.username}`}
          className="shrink-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]"
        >
          <div className="rounded-full bg-white p-[2px]">
            <UserAvatar
              src={post.author.avatarUrl}
              alt={post.author.username}
              size="sm"
            />
          </div>
        </Link>
        <div className="flex min-w-0 items-center gap-1">
          <Link
            to={`/profile/${post.author.username}`}
            className="truncate text-sm font-semibold hover:underline"
          >
            {post.author.username}
          </Link>
          <span className="text-xs text-[#737373]">•</span>
          <span className="flex-shrink-0 text-xs text-zinc-400">
            {formatTimeAgo(post.createdAt)}
          </span>
          <span className="text-xs text-[#737373]">•</span>
          <Link
            to={`/profile/${post.author.username}`}
            className="ml-10 flex-shrink-0 text-xs font-semibold text-[#0095F6] hover:text-[#1aa1ff]"
          >
            follow
          </Link>
        </div>
      </CardHeader>

      {/* Image — portrait aspect ratio (5:7) */}
      <button
        onClick={() => onOpenPost(post)}
        className="aspect-[5/7] w-full bg-zinc-100"
      >
        <img
          src={post.imageUrl}
          alt={post.caption || 'Post image'}
          className="h-full w-full object-cover"
        />
      </button>

      {/* Actions + like count */}
      <CardContent className="flex flex-col gap-1 p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenPost(post)}
            className="transition-colors hover:text-zinc-500"
          >
            <Heart
              className={`h-5 w-5 ${
                post.isLiked ? 'fill-red-500 text-red-500' : 'text-[#262626]'
              }`}
            />
          </button>
          <button
            onClick={() => onOpenPost(post)}
            className="transition-colors hover:text-zinc-500"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm font-semibold">
          {post.likeCount.toLocaleString()} likes
        </p>
      </CardContent>

      {/* Caption + view all comments */}
      <CardFooter className="flex-col items-start gap-1 p-3 pt-0">
        {post.caption && (
          <div className="w-full text-sm">
            <p
              ref={captionRef}
              className={captionExpanded ? '' : 'line-clamp-1'}
            >
              <span className="font-semibold">{post.author.username}</span>{' '}
              {post.caption}
            </p>
            {!captionExpanded && isClamped && (
              <button
                onClick={() => setCaptionExpanded(true)}
                className="text-zinc-400"
              >
                more
              </button>
            )}
          </div>
        )}
        {post.commentCount > 0 && (
          <button
            onClick={() => onOpenPost(post)}
            className="text-sm text-zinc-400 hover:text-zinc-600"
          >
            View all comments ({post.commentCount})
          </button>
        )}
      </CardFooter>
    </Card>
  );
};
