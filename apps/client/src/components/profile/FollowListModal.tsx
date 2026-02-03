import { MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  useFollowers,
  useFollowing,
  useCreateConversation,
  useProfile,
} from '../../hooks';
import { useChatStore } from '../../stores/chat';
import { UserAvatar } from '../ui/user-avatar';

type FollowListModalProps = {
  username: string;
  type: 'followers' | 'following';
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const FollowListModal = ({
  username,
  type,
  open,
  onOpenChange,
}: FollowListModalProps) => {
  const navigate = useNavigate();
  const { data: me } = useProfile();
  const createConversation = useCreateConversation();
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);

  const isFollowersList = type === 'followers';
  const followersQuery = useFollowers(username, open && isFollowersList);
  const followingQuery = useFollowing(username, open && !isFollowersList);

  const query = isFollowersList ? followersQuery : followingQuery;
  const users = query.data?.pages.flatMap((page) => page.data) ?? [];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop - clientHeight < 100 &&
      query.hasNextPage &&
      !query.isFetchingNextPage
    ) {
      query.fetchNextPage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[400px] min-h-[200px] flex-col p-0">
        <DialogHeader className="p-4">
          <DialogTitle className="text-center text-base font-semibold">
            {type === 'followers' ? 'Followers' : 'Following'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {type === 'followers' ? 'List of followers' : 'List of following'}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
          {users.length === 0 && !query.isLoading && (
            <p className="py-8 text-center text-sm text-zinc-500">
              {type === 'followers'
                ? 'No followers yet'
                : 'Not following anyone'}
            </p>
          )}

          {users.map((user) => {
            const isOwnProfile = me?.username === user.username;

            return (
              <div key={user.id} className="flex items-center gap-3 px-4 py-2">
                <Link
                  to={`/profile/${user.username}`}
                  onClick={() => onOpenChange(false)}
                  className="flex-shrink-0"
                >
                  <UserAvatar
                    src={user.avatarUrl}
                    alt={user.username}
                    size="md"
                  />
                </Link>

                <Link
                  to={`/profile/${user.username}`}
                  onClick={() => onOpenChange(false)}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-sm font-semibold">
                    {user.username}
                  </p>
                  {user.fullName && (
                    <p className="truncate text-sm text-zinc-500">
                      {user.fullName}
                    </p>
                  )}
                </Link>

                {!isOwnProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                    disabled={createConversation.isPending}
                    onClick={() => {
                      createConversation.mutate(
                        { participantId: user.id },
                        {
                          onSuccess: (data) => {
                            onOpenChange(false);
                            setActiveConversation(data.conversation.id);
                            navigate('/messages');
                          },
                        },
                      );
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                )}
              </div>
            );
          })}

          {query.isLoading && (
            <p className="py-4 text-center text-sm text-zinc-500">Loading...</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
