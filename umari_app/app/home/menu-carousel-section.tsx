"use client"

import type { Menu } from "@/lib/types"
import { MenuCarouselEmpty } from "./menu-carousel-empty"
import { MenuCarouselContent } from "./menu-carousel-content"

interface MenuCarouselSectionProps {
  menus: Menu[]
}

export function MenuCarouselSection({ menus }: MenuCarouselSectionProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground mb-4">Your Menus</h2>

      {menus.length === 0 ? (
        <MenuCarouselEmpty />
      ) : (
        <MenuCarouselContent menus={menus} />
      )}
    </div>
  )
}
