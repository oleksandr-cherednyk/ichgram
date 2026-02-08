import { LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import logo from '../../assets/logo/logo.png';
import {
  useLogout,
  useProfile,
  useUnreadCount,
  useUnreadMessageCount,
} from '../../hooks';
import { navItems } from '../../lib/navigation';
import { cn } from '../../lib/utils';
import { useCreatePostStore } from '../../stores/createPost';
import { useNotificationStore } from '../../stores/notification';
import { useSearchStore } from '../../stores/search';
import { UserAvatar } from '../ui/user-avatar';

export const Sidebar = () => {
  const handleLogout = useLogout();
  const { data: user } = useProfile();
  const { data: unreadData } = useUnreadCount();
  const { data: unreadMessageData } = useUnreadMessageCount();
  const openCreatePost = useCreatePostStore((s) => s.open);
  const openSearch = useSearchStore((s) => s.open);
  const openNotifications = useNotificationStore((s) => s.open);
  const unreadCount = unreadData?.count ?? 0;
  const unreadMessageCount = unreadMessageData?.count ?? 0;

  return (
    <aside className="relative z-40 hidden flex-shrink-0 flex-col border-r border-[#DBDBDB] bg-white px-3 py-6 md:flex md:w-[72px] xl:w-[245px]">
      {/* Logo (hidden when sidebar is collapsed) */}
      <div className="mb-6 hidden px-3 xl:block">
        <NavLink to="/">
          <img
            src={logo}
            alt="ICHGRAM"
            className="h-[54px] w-[96px] object-contain"
          />
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navItems
          .filter((item) => item.showOnDesktop !== false)
          .map((item) => {
            if (item.action === 'create') {
              return (
                <button
                  key="create"
                  onClick={openCreatePost}
                  className="flex items-center gap-4 rounded-lg px-3 py-3 text-base font-normal transition-colors hover:bg-zinc-100"
                >
                  {item.icon}
                  <span className="hidden xl:inline">{item.label}</span>
                </button>
              );
            }

            if (item.action === 'search') {
              return (
                <button
                  key="search"
                  onClick={openSearch}
                  className="flex items-center gap-4 rounded-lg px-3 py-3 text-base font-normal transition-colors hover:bg-zinc-100"
                >
                  {item.icon}
                  <span className="hidden xl:inline">{item.label}</span>
                </button>
              );
            }

            if (item.action === 'notifications') {
              const notifIcon =
                unreadCount > 0 ? (
                  <span className="relative">
                    {item.icon}
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </span>
                ) : (
                  item.icon
                );

              return (
                <button
                  key="notifications"
                  onClick={openNotifications}
                  className="flex items-center gap-4 rounded-lg px-3 py-3 text-base font-normal transition-colors hover:bg-zinc-100"
                >
                  {notifIcon}
                  <span className="hidden xl:inline">{item.label}</span>
                </button>
              );
            }

            const iconWithBadge =
              item.to === '/messages' && unreadMessageCount > 0 ? (
                <span className="relative">
                  {item.icon}
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                  </span>
                </span>
              ) : (
                item.icon
              );

            return (
              <NavLink
                key={item.to}
                to={item.to!}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-4 rounded-lg px-3 py-3 text-base transition-colors hover:bg-zinc-100',
                    isActive ? 'font-semibold' : 'font-normal',
                  )
                }
              >
                {iconWithBadge}
                <span className="hidden xl:inline">{item.label}</span>
              </NavLink>
            );
          })}

        {/* Profile link with avatar */}
        <NavLink
          to="/me"
          className={({ isActive }) =>
            cn(
              'mt-12 flex items-center gap-4 rounded-lg px-3 py-3 text-base transition-colors hover:bg-zinc-100',
              isActive ? 'font-semibold' : 'font-normal',
            )
          }
        >
          <UserAvatar src={user?.avatarUrl} alt={user?.username} size="xs" />
          <span className="hidden xl:inline">Profile</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 rounded-lg px-3 py-3 text-base font-normal text-red-500 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-6 w-6" />
          <span className="hidden xl:inline">Log out</span>
        </button>
      </nav>
    </aside>
  );
};
