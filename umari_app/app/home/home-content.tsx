"use client"

import type React from "react"
import type { Menu } from "@/lib/types"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StickyFooter } from "@/components/landing/sticky-footer"
import { MenuCarouselSection } from "./menu-carousel-section"

interface HomeContentProps {
  menus: Menu[]
}

export function HomeContent({ menus }: HomeContentProps) {
  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-36">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Umari
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start creating menus, managing orders, and growing your business.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card border-2 border-secondary/40 hover:border-secondary/60 rounded-xl p-6 shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Profile</h2>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              Manage your account settings and profile information.
            </p>
            <Link href="/profile">
              <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                View Profile
              </Button>
            </Link>
          </motion.div>

          {/* Orders Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border-2 border-secondary/40 hover:border-secondary/60 rounded-xl p-6 shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Orders</h2>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              View and manage incoming orders in real-time.
            </p>
            <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              View Orders
            </Button>
          </motion.div>

          {/* Payments Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card border-2 border-secondary/40 hover:border-secondary/60 rounded-xl p-6 shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Payments</h2>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              Setup and manage payments to get paid instantly.
            </p>
            <Link href="/payments">
              <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Manage Payments
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Menu Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
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

