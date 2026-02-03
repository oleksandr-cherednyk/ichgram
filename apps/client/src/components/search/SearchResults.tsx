import { Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { SearchTag, SearchUser } from '../../types/search';
import { UserAvatar } from '../ui/user-avatar';

type SearchResultsProps = {
  users: SearchUser[];
  tags: SearchTag[];
  isLoading: boolean;
  onClose: () => void;
};

export const SearchResults = ({
  users,
  tags,
  isLoading,
  onClose,
}: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-zinc-500">
        Searching...
      </div>
    );
  }

  if (users.length === 0 && tags.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-zinc-500">
        No results found
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Users section */}
      {users.length > 0 && (
        <div>
          <div className="px-4 py-2 text-sm font-semibold text-zinc-500">
            Recent
          </div>
          {users.map((user) => (
            <Link
              key={user.id}
              to={`/profile/${user.username}`}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-zinc-50"
            >
              <UserAvatar src={user.avatarUrl} alt={user.username} size="md" />
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-semibold">
                  {user.username}
                </span>
                <span className="truncate text-sm text-zinc-500">
                  {user.fullName}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Tags section */}
      {tags.length > 0 && (
        <div>
          <div className="px-4 py-2 text-sm font-semibold text-zinc-500">
            Tags
          </div>
          {tags.map((tag) => (
            <Link
              key={tag.tag}
              to={`/tags/${tag.tag}`}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-zinc-50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-zinc-300">
                <Hash className="h-5 w-5 text-zinc-600" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-semibold">
                  #{tag.tag}
                </span>
                <span className="text-sm text-zinc-500">
                  {tag.postsCount.toLocaleString()}{' '}
                  {tag.postsCount === 1 ? 'post' : 'posts'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
