import { NavLink } from 'react-router-dom';

import logo from '../../assets/logo/logo.png';
import { navItems } from '../../lib/navigation';
import { cn } from '../../lib/utils';

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[245px] flex-col border-r border-[#DBDBDB] bg-white px-3 py-6 md:flex xl:w-[335px]">
      {/* Logo */}
      <div className="mb-6 px-3">
        <NavLink to="/">
          <img
            src={logo}
            alt="ICHGRAM"
            className="h-10 w-auto object-contain"
          />
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-4 rounded-lg px-3 py-3 text-base transition-colors hover:bg-zinc-100',
                isActive ? 'font-semibold' : 'font-normal',
              )
            }
          >
            {item.icon}
            <span className="hidden xl:inline">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
