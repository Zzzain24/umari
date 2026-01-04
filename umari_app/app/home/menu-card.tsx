"use client"

import type { Menu } from "@/lib/types"

interface MenuCardProps {
  menu: Menu
}

export function MenuCard({ menu }: MenuCardProps) {
  const formattedDate = new Date(menu.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  const itemCount = menu.items_count || 0
  const itemText = itemCount === 1 ? 'item' : 'items'

  return (
    <div className="bg-card border border-secondary/40 hover:border-secondary/60 rounded-xl p-4 transition-all duration-200 cursor-pointer h-full flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {menu.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        {itemCount} {itemText}
      </p>
      <p className="text-xs text-muted-foreground mt-auto">
        Created {formattedDate}
      </p>
    </div>
  )
}
