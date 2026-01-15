"use client"

import type React from "react"
import type { Menu } from "@/lib/types"
import { motion } from "framer-motion"
import Link from "next/link"
import { StickyFooter } from "@/components/landing/sticky-footer"
import { MenuCarouselSection } from "./menu-carousel-section"
import { Separator } from "@/components/ui/separator"
import { User, ClipboardList, CreditCard, ChevronRight } from "lucide-react"

interface HomeContentProps {
  menus: Menu[]
}

export function HomeContent({ menus }: HomeContentProps) {
  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-36 relative">
        {/* Decorative blur elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Welcome Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome to Umari
            </h1>
            <p className="text-muted-foreground">
              Start creating menus, managing orders, and growing your business.
            </p>
          </div>

          {/* Quick Links */}
          <div className="bg-card border border-border rounded-xl p-2 shadow-sm mb-8">
            {/* Profile Row */}
            <Link href="/profile" className="group block">
              <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Profile</p>
                    <p className="text-xs text-muted-foreground">Manage your account settings</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>

            <Separator className="mx-4" />

            {/* Orders Row */}
            <Link href="/orders" className="group block">
              <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Orders</p>
                    <p className="text-xs text-muted-foreground">View and manage incoming orders</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>

            <Separator className="mx-4" />

            {/* Payments Row */}
            <Link href="/payments" className="group block">
              <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Payments</p>
                    <p className="text-xs text-muted-foreground">Setup and manage payment methods</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          </div>

          {/* Menu Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MenuCarouselSection menus={menus} />
          </motion.div>
        </motion.div>
      </main>

      {/* Sticky Footer */}
      <StickyFooter />
    </>
  )
}

