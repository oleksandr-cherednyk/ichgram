import { NavLink } from 'react-router-dom';

import { cn } from '../../lib/utils';
import { useCreatePostStore } from '../../stores/createPost';
import { useNotificationStore } from '../../stores/notification';
import { useSearchStore } from '../../stores/search';

type FooterNavItem = {
  to?: string;
  action?: 'create' | 'search' | 'notifications';
  label: string;
};

const footerNavItems: FooterNavItem[] = [
  { to: '/', label: 'Home' },
  { action: 'search', label: 'Search' },
  { to: '/explore', label: 'Explore' },
  { to: '/messages', label: 'Messages' },
  { action: 'notifications', label: 'Notifications' },
  { action: 'create', label: 'Create' },
];

export const Footer = () => {
  const openCreatePost = useCreatePostStore((s) => s.open);
  const openSearch = useSearchStore((s) => s.open);
  const openNotifications = useNotificationStore((s) => s.open);

  const actionHandlers: Record<string, () => void> = {
    create: openCreatePost,
    search: openSearch,
    notifications: openNotifications,
  };

  return (
    <footer className="hidden h-[158px] flex-shrink-0 bg-white md:flex md:flex-col">
      {/* Navigation row - top */}
      <nav className="flex items-center justify-center gap-10 pt-4">
        {footerNavItems.map((item) =>
          item.action ? (
            <button
              key={item.action}
              onClick={actionHandlers[item.action]}
              className="text-xs text-[#737373] transition-colors hover:text-zinc-900"
            >
              {item.label}
            </button>
          ) : (
            <NavLink
              key={item.to}
              to={item.to!}
              className={({ isActive }) =>
                cn(
                  'text-xs text-[#737373] transition-colors hover:text-zinc-900',
                  isActive && 'text-zinc-900',
                )
              }
            >
              {item.label}
            </NavLink>
          ),
        )}
      </nav>

      {/* Copyright row - centered in remaining space */}
      <div className="flex flex-1 items-center justify-center gap-1.5 text-xs text-[#737373]">
        <span>©</span>
        <span>2026</span>
        <span>ICHgram</span>
      </div>
    </footer>
  );
};
