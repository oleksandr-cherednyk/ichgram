import { LinkIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useCreateConversation } from '../../hooks';
import { useChatStore } from '../../stores/chat';
import type { UserProfile } from '../../types/user';
import { Button } from '../ui/button';
import { UserAvatar } from '../ui/user-avatar';
import { FollowListModal } from './FollowListModal';

type ProfileHeaderProps = {
  user: UserProfile;
  isOwnProfile: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  isFollowing?: boolean;
  isFollowLoading?: boolean;
};

const Bio = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setClamped(el.scrollHeight > el.clientHeight);
    }
  }, [text]);

  return (
    <p className="text-sm text-[#262626]">
      <span ref={textRef} className={expanded ? '' : 'line-clamp-3'}>
        {text}
      </span>
      {!expanded && clamped && (
        <button
          onClick={() => setExpanded(true)}
          className="ml-1 font-semibold text-zinc-900"
        >
          more
        </button>
      )}
    </p>
  );
};

export const ProfileHeader = ({
  user,
  isOwnProfile,
  onFollow,
  onUnfollow,
  isFollowing,
  isFollowLoading,
}: ProfileHeaderProps) => {
  const navigate = useNavigate();
  const createConversation = useCreateConversation();
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const [followModal, setFollowModal] = useState<
    'followers' | 'following' | null
  >(null);

  const handleMessage = () => {
    createConversation.mutate(
      { participantId: user.id },
      {
        onSuccess: (data) => {
          setActiveConversation(data.conversation.id);
          navigate('/messages');
        },
      },
    );
  };

  return (
    <header className="flex flex-col gap-6 pb-8 md:flex-row md:items-start md:gap-[88px]">
      {/* Avatar with gradient ring */}
      <div className="mx-auto shrink-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-1 md:mx-0">
        <div className="rounded-full bg-white p-1">
          <UserAvatar
            src={user.avatarUrl}
            alt={user.username}
            size="2xl"
            className="md:h-36 md:w-36"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex-1 text-center md:text-left">
        {/* Username and action button */}
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <h1 className="text-xl">{user.username}</h1>
          {isOwnProfile ? (
            <Link
              to="/me/edit"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#EFEFEF] px-6 md:px-16 text-sm font-semibold text-zinc-900 transition hover:bg-[#E5E5E5]"
            >
              Edit profile
            </Link>
          ) : (
            <div className="flex items-center gap-[16px]">
              <Button
                variant="default"
                size="sm"
                className="px-6 md:px-16"
                onClick={isFollowing ? onUnfollow : onFollow}
                disabled={isFollowLoading}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-6 md:px-16"
                onClick={handleMessage}
                disabled={createConversation.isPending}
              >
                Message
              </Button>
            </div>
          )}
        </div>

        <div className="max-w-[460px]">
          {/* Stats */}
          <div className="mt-4 flex justify-between">
            <div>
              <span className="font-semibold">{user.postsCount}</span> posts
            </div>
            <button
              className="hover:underline"
              onClick={() => setFollowModal('followers')}
            >
              <span className="font-semibold">{user.followersCount}</span>{' '}
              followers
            </button>
            <button
              className="hover:underline"
              onClick={() => setFollowModal('following')}
            >
              <span className="font-semibold">{user.followingCount}</span>{' '}
              following
            </button>
          </div>

          {/* Bio */}
          <div className="mt-4">
            {user.bio && <Bio text={user.bio} />}
            {user.website && (
              <a
                href={
                  user.website.startsWith('http')
                    ? user.website
                    : `https://${user.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#00376B] hover:underline"
              >
                <LinkIcon className="h-3 w-3" />
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Follow List Modal */}
      {followModal && (
        <FollowListModal
          username={user.username}
          type={followModal}
          open={!!followModal}
          onOpenChange={(open) => {
            if (!open) setFollowModal(null);
          }}
        />
      )}
    </header>
  );
};
