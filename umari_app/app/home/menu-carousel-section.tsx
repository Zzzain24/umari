"use client"

import type { Menu } from "@/lib/types"
import { MenuCarouselEmpty } from "./menu-carousel-empty"
import { MenuCarouselContent } from "./menu-carousel-content"

interface MenuCarouselSectionProps {
  menus: Menu[]
}

export function MenuCarouselSection({ menus }: MenuCarouselSectionProps) {
  return (
    <div className="bg-card border-2 border-secondary/40 rounded-xl p-8 shadow-lg">
      <h2 className="text-2xl font-semibold text-foreground mb-6">Your Menus</h2>

      {menus.length === 0 ? (
        <MenuCarouselEmpty />
      ) : (
        <MenuCarouselContent menus={menus} />
      )}
    </div>
  )
}
