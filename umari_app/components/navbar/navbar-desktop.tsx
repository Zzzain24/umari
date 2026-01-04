"use client"

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CircleUserRound, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { userMenuItems, type MenuItem } from './user-menu-items';

export function NavbarDesktop() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.action === 'logout') {
      handleLogout();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <div className="hidden md:flex items-center justify-between w-full">
      {/* Left side: Logo + Text */}
      <Link
        href="/home"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <img
          src="/images/umari-logo.png"
          alt="Umari Logo"
          className="w-8 h-8 object-contain"
        />
        <span className="text-lg font-bold text-foreground">Umari</span>
      </Link>

      {/* Right side: Account PFP + Hamburger Menu */}
      <div className="flex items-center gap-2">
        {/* Account Profile Picture */}
        <Link
          href="/profile"
          className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
        >
          <CircleUserRound className="w-6 h-6 text-foreground" />
        </Link>

        {/* Hamburger Menu Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-accent"
            >
              <Menu className="w-6 h-6" />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {userMenuItems.map((item, index) => (
              <div key={item.id}>
                {item.action === 'logout' && index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={() => handleMenuItemClick(item)}
                  className="cursor-pointer"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
