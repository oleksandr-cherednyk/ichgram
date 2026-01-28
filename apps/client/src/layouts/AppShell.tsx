import { Outlet } from 'react-router-dom';

import { MobileNav, Sidebar } from '../components/layout';

export const AppShell = () => {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <MobileNav />

      {/* Main content area */}
      <main className="pb-14 md:ml-[245px] md:pb-0 xl:ml-[335px]">
        <Outlet />
      </main>
    </div>
  );
};
