import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { CreatePostModal } from '../components/feed';
import { Footer, MobileMenu, MobileNav, Sidebar } from '../components/layout';
import { NotificationOverlay } from '../components/notifications';
import { SearchOverlay } from '../components/search';
import { Toaster } from '../components/ui/sonner';
import {
  connectSocket,
  disconnectSocket,
  updateSocketToken,
} from '../lib/socket';
import { useSocketMessages, useSocketNotifications } from '../hooks';
import { useAuthStore } from '../stores/auth';
import { useCreatePostStore } from '../stores/createPost';
import { useNotificationStore } from '../stores/notification';
import { useSearchStore } from '../stores/search';

export const AppShell = () => {
  const { isOpen, close } = useCreatePostStore();
  const accessToken = useAuthStore((state) => state.accessToken);
  const searchOpen = useSearchStore((s) => s.isOpen);
  const notificationOpen = useNotificationStore((s) => s.isOpen);
  const overlayOpen = searchOpen || notificationOpen;

  useSocketMessages();
  useSocketNotifications();

  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      return;
    }

    updateSocketToken(accessToken);
    connectSocket();

    return () => disconnectSocket();
  }, [accessToken]);

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Top area: sidebar + content + overlays */}
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Main content area */}
        <main className="relative flex-1 overflow-y-auto pb-14 md:pb-0">
          <Outlet />
        </main>

        {/* Backdrop */}
        <div
          className={`absolute inset-0 z-20 bg-black/40 transition-opacity duration-300 md:left-[72px] xl:left-[245px] ${overlayOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        />

        {/* Search Overlay */}
        <SearchOverlay />

        {/* Notification Overlay */}
        <NotificationOverlay />
      </div>

      {/* Footer (desktop only) */}
      <Footer />

      {/* Mobile nav */}
      <MobileMenu />
      <MobileNav />

      {/* Create Post Modal */}
      <CreatePostModal isOpen={isOpen} onClose={close} />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
};
