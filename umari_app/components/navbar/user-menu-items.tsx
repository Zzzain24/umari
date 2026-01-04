import { User, Menu, ShoppingBag, CreditCard, Info, LogOut } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: 'logout';
}

export const userMenuItems: MenuItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    href: '/profile'
  },
  {
    id: 'menus',
    label: 'Menus',
    icon: Menu,
    href: '/menus'
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingBag,
    href: '/orders'
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: CreditCard,
    href: '/payments'
  },
  {
    id: 'about',
    label: 'About',
    icon: Info,
    href: '/about'
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: LogOut,
    action: 'logout'
  }
];
