import { NavLink } from 'react-router-dom';

import { navItems } from '../../lib/navigation';
import { cn } from '../../lib/utils';

export const MobileNav = () => {
  const mobileItems = navItems.filter((item) => item.showOnMobile);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-[#DBDBDB] bg-white md:hidden">
      {mobileItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex h-full flex-1 items-center justify-center transition-colors',
              isActive ? 'text-zinc-900' : 'text-zinc-500',
            )
          }
        >
          {item.icon}
        </NavLink>
      ))}
    </nav>
  );
};
