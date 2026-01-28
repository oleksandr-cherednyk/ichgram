import {
  Compass,
  Heart,
  Home,
  MessageCircle,
  PlusSquare,
  Search,
  User,
} from 'lucide-react';

export type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  showOnMobile: boolean;
};

export const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Home',
    icon: <Home className="h-6 w-6" />,
    showOnMobile: true,
  },
  {
    to: '/search',
    label: 'Search',
    icon: <Search className="h-6 w-6" />,
    showOnMobile: true,
  },
  {
    to: '/explore',
    label: 'Explore',
    icon: <Compass className="h-6 w-6" />,
    showOnMobile: true,
  },
  {
    to: '/messages',
    label: 'Messages',
    icon: <MessageCircle className="h-6 w-6" />,
    showOnMobile: false,
  },
  {
    to: '/notifications',
    label: 'Notifications',
    icon: <Heart className="h-6 w-6" />,
    showOnMobile: false,
  },
  {
    to: '/create',
    label: 'Create',
    icon: <PlusSquare className="h-6 w-6" />,
    showOnMobile: true,
  },
  {
    to: '/me',
    label: 'Profile',
    icon: <User className="h-6 w-6" />,
    showOnMobile: true,
  },
];
