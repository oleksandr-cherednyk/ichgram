import { User } from 'lucide-react';

import type { UserProfile } from '../../types/user';
import { Button } from '../ui/button';

type ProfileHeaderProps = {
  user: UserProfile;
  isOwnProfile: boolean;
  onEditProfile?: () => void;
  onFollow?: () => void;
  onUnfollow?: () => void;
  isFollowing?: boolean;
  isFollowLoading?: boolean;
};

export const ProfileHeader = ({
  user,
  isOwnProfile,
  onEditProfile,
  onFollow,
  onUnfollow,
  isFollowing,
  isFollowLoading,
}: ProfileHeaderProps) => {
  return (
    <header className="flex flex-col gap-8 pb-8 md:flex-row md:items-start">
      {/* Avatar */}
      <div className="mx-auto h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-zinc-100 md:mx-0 md:h-36 md:w-36">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            <User className="h-10 w-10 md:h-16 md:w-16" />
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="flex-1 text-center md:text-left">
        {/* Username and action button */}
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <h1 className="text-xl">{user.username}</h1>
          {isOwnProfile ? (
            <Button variant="outline" size="sm" onClick={onEditProfile}>
              Edit profile
            </Button>
          ) : (
            <Button
              variant={isFollowing ? 'outline' : 'default'}
              size="sm"
              onClick={isFollowing ? onUnfollow : onFollow}
              disabled={isFollowLoading}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 flex justify-center gap-8 md:justify-start">
          <div>
            <span className="font-semibold">{user.postsCount}</span> posts
          </div>
          <button className="hover:underline">
            <span className="font-semibold">{user.followersCount}</span>{' '}
            followers
          </button>
          <button className="hover:underline">
            <span className="font-semibold">{user.followingCount}</span>{' '}
            following
          </button>
        </div>

        {/* Bio */}
        <div className="mt-4">
          <p className="font-semibold">{user.fullName}</p>
          {user.bio && <p className="text-sm text-zinc-500">{user.bio}</p>}
        </div>
      </div>
    </header>
  );
};
