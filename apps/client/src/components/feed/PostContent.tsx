import { MessageCircle, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useFollow, useProfile, useUnfollow, useUser } from '../../hooks';
import { formatTimeAgo } from '../../lib/utils';
import type { FeedPost } from '../../types/post';
import { CaptionText } from '../common/CaptionText';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { UserAvatar } from '../ui/user-avatar';
import { CommentInput } from './CommentInput';
import { CommentsSection } from './CommentsSection';
import { LikeButton } from './LikeButton';

type PostContentProps = {
  post: FeedPost;
  onLinkClick?: () => void;
  onShowActions: () => void;
};

export const PostContent = ({
  post,
  onLinkClick,
  onShowActions,
}: PostContentProps) => {
  const { data: currentUser } = useProfile();
  const { data: authorProfile } = useUser(post.author.username);
  const follow = useFollow();
  const unfollow = useUnfollow();

  const isOwnPost = currentUser?.id === post.author.id;
  const isFollowing = authorProfile?.isFollowing ?? false;

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollow.mutate(post.author.username);
    } else {
      follow.mutate(post.author.username);
    }
  };

  const headerContent = (
    <>
      <Link to={`/profile/${post.author.username}`} onClick={onLinkClick}>
        <UserAvatar
          src={post.author.avatarUrl}
          alt={post.author.username}
          size="sm"
        />
      </Link>
      <div className="flex items-center gap-2">
        <Link
          to={`/profile/${post.author.username}`}
          onClick={onLinkClick}
          className="text-sm font-semibold hover:underline"
        >
          {post.author.username}
        </Link>
        {!isOwnPost && (
          <>
            <span className="text-base font-bold text-[#262626]">·</span>
            <button
              onClick={handleFollowToggle}
              disabled={follow.isPending || unfollow.isPending}
              className={`text-sm font-semibold ${
                isFollowing
                  ? 'text-zinc-900 hover:text-zinc-500'
                  : 'text-[#0095F6] hover:text-[#1aa1ff]'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </>
        )}
      </div>
      <div className="ml-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onShowActions}
              className="text-[#262626] transition-colors hover:text-zinc-500"
            >
              <MoreHorizontal className="h-6 w-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent>More options</TooltipContent>
        </Tooltip>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header - above image */}
      <div className="flex items-center gap-3 border-b border-[#DBDBDB] p-4 md:hidden">
        {headerContent}
      </div>

      {/* Left side - Image */}
      <div className="flex items-center justify-center bg-black md:flex-1">
        <img
          src={post.imageUrl}
          alt={post.caption || 'Post image'}
          className="w-full max-h-[50vh] object-contain md:h-full md:max-h-none"
        />
      </div>

      {/* Right side - Content */}
      <div className="flex w-full md:w-[400px] flex-col">
        {/* Header - desktop only */}
        <div className="hidden md:flex items-center gap-3 p-4">
          {headerContent}
        </div>

        <Separator />

        {/* Caption & Comments area (scrollable) */}
        <ScrollArea className="md:flex-1">
          <div className="p-4">
            {post.caption && (
              <div className="mb-4 flex gap-3">
                <Link
                  to={`/profile/${post.author.username}`}
                  onClick={onLinkClick}
                >
                  <UserAvatar
                    src={post.author.avatarUrl}
                    alt={post.author.username}
                    size="sm"
                  />
                </Link>
                <div>
                  <p className="text-sm">
                    <Link
                      to={`/profile/${post.author.username}`}
                      onClick={onLinkClick}
                      className="mr-1 font-semibold hover:underline"
                    >
                      {post.author.username}
                    </Link>
                    <CaptionText text={post.caption} />
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {formatTimeAgo(post.createdAt)}
                  </p>
                </div>
              </div>
            )}

            <CommentsSection postId={post.id} onLinkClick={onLinkClick} />
          </div>
        </ScrollArea>

        {/* Action bar */}
        <Separator />
        <div>
          <div className="flex items-center gap-4 p-4">
            <LikeButton postId={post.id} isLiked={post.isLiked ?? false} />
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="transition-colors hover:text-zinc-500">
                  <MessageCircle className="h-6 w-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Comment</TooltipContent>
            </Tooltip>
          </div>

          <div className="px-4 pb-1">
            <p className="text-sm font-semibold">
              {post.likeCount.toLocaleString()} likes
            </p>
          </div>

          <div className="px-4 pb-3">
            <p className="text-xs text-zinc-400">
              {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Comment input */}
        <CommentInput postId={post.id} />
      </div>
    </>
  );
};
