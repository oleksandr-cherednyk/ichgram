import {
  Compass,
  Heart,
  Home,
  Menu,
  MessageCircle,
  PlusSquare,
  Search,
} from 'lucide-react';

export type NavItem = {
  to?: string;
  action?: 'create' | 'search' | 'notifications' | 'menu';
  label: string;
  icon: React.ReactNode;
  showOnMobile: boolean;
  showOnDesktop?: boolean;
};

export const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Home',
    icon: <Home className="h-6 w-6" />,
    showOnMobile: true,
  },
  {
    action: 'search',
    label: 'Search',
    icon: <Search className="h-6 w-6" />,
    showOnMobile: true,
  },
  {
    to: '/explore',
    label: 'Explore',
    icon: <Compass className="h-6 w-6" />,
    showOnMobile: false,
  },
  {
    to: '/messages',
    label: 'Messages',
    icon: <MessageCircle className="h-6 w-6" />,
    showOnMobile: true,
  },
  {
    action: 'notifications',
    label: 'Notifications',
    icon: <Heart className="h-6 w-6" />,
    showOnMobile: false,
  },
  {
    action: 'create',
    label: 'Create',
    icon: <PlusSquare className="h-6 w-6" />,
    showOnMobile: true,
  },
  {
    action: 'menu',
    label: 'Menu',
    icon: <Menu className="h-6 w-6" />,
    showOnMobile: true,
    showOnDesktop: false,
  },
];
