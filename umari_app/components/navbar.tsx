"use client"

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { NavbarDesktop } from './navbar/navbar-desktop';
import { NavbarMobile } from './navbar/navbar-mobile';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        // Base styles
        "sticky top-4 z-50 mx-auto w-full transition-all duration-300",
        // Floating/rounded container
        "rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg",
        // Padding and sizing
        "px-4 py-3",
        // Responsive max-width (shrinks slightly on scroll like landing page)
        isScrolled ? "max-w-4xl" : "max-w-5xl",
        // Performance optimizations from landing page
        "will-change-transform transform-gpu",
        className
      )}
    >
      <NavbarDesktop />
      <NavbarMobile />
    </nav>
  );
}
