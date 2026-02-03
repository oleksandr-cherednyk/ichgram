import { NavLink } from 'react-router-dom';

import { navItems } from '../../lib/navigation';
import { cn } from '../../lib/utils';
import { useCreatePostStore } from '../../stores/createPost';
import { useMobileMenuStore } from '../../stores/mobileMenu';
import { useSearchStore } from '../../stores/search';

const mobileOrder = ['/', 'search', 'create', '/messages', 'menu'];

export const MobileNav = () => {
  const openCreatePost = useCreatePostStore((s) => s.open);
  const openSearch = useSearchStore((s) => s.open);
  const toggleMenu = useMobileMenuStore((s) => s.toggle);
  const mobileItems = navItems
    .filter((item) => item.showOnMobile)
    .sort((a, b) => {
      const keyA = a.action ?? a.to ?? '';
      const keyB = b.action ?? b.to ?? '';
      return mobileOrder.indexOf(keyA) - mobileOrder.indexOf(keyB);
    });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] flex h-14 items-center justify-around border-t border-[#DBDBDB] bg-white md:hidden">
      {mobileItems.map((item) => {
        const key = item.action ?? item.to ?? item.label;

        if (item.action === 'create') {
          return (
            <button
              key={key}
              onClick={openCreatePost}
              className="flex h-full flex-1 items-center justify-center text-zinc-500 transition-colors"
            >
              {item.icon}
            </button>
          );
        }

        if (item.action === 'search') {
          return (
            <button
              key={key}
              onClick={openSearch}
              className="flex h-full flex-1 items-center justify-center text-zinc-500 transition-colors"
            >
              {item.icon}
            </button>
          );
        }

        if (item.action === 'menu') {
          return (
            <button
              key={key}
              onClick={toggleMenu}
              className="flex h-full flex-1 items-center justify-center text-zinc-500 transition-colors"
            >
              {item.icon}
            </button>
          );
        }

        return (
          <NavLink
            key={key}
            to={item.to!}
            className={({ isActive }) =>
              cn(
                'flex h-full flex-1 items-center justify-center transition-colors',
                isActive ? 'text-zinc-900' : 'text-zinc-500',
              )
            }
          >
            {item.icon}
          </NavLink>
        );
      })}
    </nav>
  );
};
