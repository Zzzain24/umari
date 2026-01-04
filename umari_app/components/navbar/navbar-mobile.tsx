"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu as MenuIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { userMenuItems, type MenuItem } from './user-menu-items';

export function NavbarMobile() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setOpen(false);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleMenuItemClick = (item: MenuItem) => {
    setOpen(false);

    if (item.action === 'logout') {
      handleLogout();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <div className="flex md:hidden items-center justify-between w-full">
      {/* Left side: Logo + Text */}
      <Link
        href="/home"
        className="flex items-center gap-2"
      >
        <img
          src="/images/umari-logo.png"
          alt="Umari Logo"
          className="w-7 h-7 object-contain"
        />
        <span className="text-base font-bold text-foreground">Umari</span>
      </Link>

      {/* Right side: Hamburger Menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <MenuIcon className="w-6 h-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-2 mt-6">
            {userMenuItems.map((item) => (
              <Button
                key={item.id}
                variant={item.action === 'logout' ? 'destructive' : 'ghost'}
                className="justify-start"
                onClick={() => handleMenuItemClick(item)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
