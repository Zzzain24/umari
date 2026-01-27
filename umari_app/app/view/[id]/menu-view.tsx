"use client"

import type React from "react"
import { MenuItemView } from "./menu-item-view"
import { CartProvider } from "@/contexts/cart-context"
import { FloatingCartButton } from "./floating-cart-button"
import { CartSheet } from "./cart-sheet"
import type { MenuItemForCart } from "@/lib/types"

interface MenuViewProps {
  menuName: string
  items: MenuItemForCart[]
  menuId: string
}

export function MenuView({ menuName, items, menuId }: MenuViewProps) {

  return (
    <CartProvider menuId={menuId} menuItems={items}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card border-2 border-secondary/40 rounded-xl p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-foreground mb-8 text-center">
            {menuName}
          </h1>

          <div className="space-y-6">
            {items.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No items available
              </p>
            ) : (
              items.map((item) => (
                <MenuItemView key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
      </div>

      <FloatingCartButton />
      <CartSheet />
    </CartProvider>
  )
}

