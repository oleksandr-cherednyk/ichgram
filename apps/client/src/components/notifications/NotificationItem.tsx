import { buildNotificationText, formatTimeAgo } from '../../lib/utils';
import type { Notification } from '../../types/notification';
import { UserAvatar } from '../ui/user-avatar';

type NotificationItemProps = {
  notification: Notification;
  onClick: () => void;
};

export const NotificationItem = ({
  notification,
  onClick,
}: NotificationItemProps) => (
  <button
    onClick={onClick}
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
      <span className="font-semibold">{notification.actor.username}</span>
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
);
