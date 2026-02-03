import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useClearNotifications,
  useMarkAsRead,
  useNotifications,
} from '../../hooks';
import { buildNotificationText, formatTimeAgo } from '../../lib/utils';
import { useNotificationStore } from '../../stores/notification';
import { useSearchStore } from '../../stores/search';
import type { Notification } from '../../types/notification';
import { PostViewModal } from '../profile';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Spinner } from '../ui/spinner';
import { UserAvatar } from '../ui/user-avatar';

export const NotificationOverlay = () => {
  const { isOpen, close } = useNotificationStore();
  const closeSearch = useSearchStore((s) => s.reset);
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useNotifications();
  const markAsRead = useMarkAsRead();
  const clearNotifications = useClearNotifications();

  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  // Close search overlay when notifications opens
  useEffect(() => {
    if (isOpen) {
      closeSearch();
    }
  }, [isOpen, closeSearch]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, close]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, close]);

  const handleOpen = (notification: Notification) => {
    if (!notification.readAt) {
      markAsRead.mutate(notification.id);
    }

    if (notification.post?.id && notification.type !== 'follow') {
      setSelectedPostId(notification.post.id);
      return;
    }

    close();
    navigate(`/profile/${notification.actor.username}`);
  };

  return (
    <>
      <div
        ref={overlayRef}
        className={`absolute left-0 md:left-[72px] top-0 z-30 flex h-full w-full md:w-[400px] flex-col md:rounded-r-2xl border-r border-[#DBDBDB] bg-white transition-transform duration-300 ease-in-out xl:left-[245px] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-6">
          <h2 className="text-2xl font-semibold">Notifications</h2>
          {notifications.length > 0 && (
            <button
              onClick={() => clearNotifications.mutate()}
              disabled={clearNotifications.isPending}
              className="rounded-lg px-3 py-1.5 text-sm text-[#0095F6] transition-colors hover:bg-zinc-100 disabled:opacity-50"
            >
              Clear all
            </button>
          )}
        </div>

        <p className="px-4 pb-3 text-base font-semibold">New</p>

        {/* Content */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-zinc-500">Failed to load notifications</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <p className="text-zinc-500">No notifications yet</p>
              <p className="text-sm text-zinc-400">
                Likes, comments, and follows will show up here
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleOpen(notification)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 ${!notification.readAt ? 'bg-blue-50/60' : ''}`}
                  >
                    <div className="relative">
                      <UserAvatar
                        src={notification.actor.avatarUrl}
                        alt={notification.actor.username}
                        size="md"
                      />
                      {!notification.readAt && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#0095F6]" />
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-0.5 text-sm">
                      <span className="font-semibold">
                        {notification.actor.username}
                      </span>
                      <span className="text-zinc-600">
                        {buildNotificationText(notification)}{' '}
                        <span className="text-zinc-400">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </span>
                    </div>

                    {notification.post?.imageUrl && (
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100">
                        <img
                          src={notification.post.imageUrl}
                          alt="Post preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {hasNextPage && (
                <div className="flex justify-center py-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="text-[#0095F6] hover:text-[#1aa1ff]"
                  >
                    {isFetchingNextPage ? <Spinner size="sm" /> : 'Load more'}
                  </Button>
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </div>

      <PostViewModal
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </>
  );
};
