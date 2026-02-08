import { Compass, Heart, LogOut } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { useLogout, useProfile, useUnreadCount } from '../../hooks';
import { cn } from '../../lib/utils';
import { useMobileMenuStore } from '../../stores/mobileMenu';
import { useNotificationStore } from '../../stores/notification';
import { UserAvatar } from '../ui/user-avatar';

export const MobileMenu = () => {
  const { isOpen, close } = useMobileMenuStore();
  const openNotifications = useNotificationStore((s) => s.open);
  const { data: user } = useProfile();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;
  const navigate = useNavigate();
  const logout = useLogout();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, close]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);

  const handleNav = (to: string) => {
    close();
    navigate(to);
  };

  const handleNotifications = () => {
    close();
    openNotifications();
  };

  const handleLogout = async () => {
    close();
    await logout();
  };

  return (
    <div
      ref={overlayRef}
      className={`fixed bottom-14 left-0 z-50 flex w-64 flex-col rounded-tr-2xl border-r border-t border-[#DBDBDB] bg-white pb-2 pt-4 transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Profile */}
      <NavLink
        to="/me"
        onClick={close}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 px-5 py-3 transition-colors hover:bg-zinc-50',
            isActive ? 'font-semibold' : 'font-normal',
          )
        }
      >
        <UserAvatar src={user?.avatarUrl} alt={user?.username} size="sm" />
        <span className="text-sm">{user?.username ?? 'Profile'}</span>
      </NavLink>

      {/* Explore */}
      <button
        onClick={() => handleNav('/explore')}
        className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-zinc-50"
      >
        <Compass className="h-6 w-6" />
        Explore
      </button>

      {/* Notifications */}
      <button
        onClick={handleNotifications}
        className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-zinc-50"
      >
        <span className="relative">
          <Heart className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
        Notifications
      </button>

      <div className="mx-4 my-1 border-t border-[#DBDBDB]" />

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-5 py-3 text-sm text-red-500 transition-colors hover:bg-red-50"
      >
        <LogOut className="h-6 w-6" />
        Log out
      </button>
    </div>
  );
};
