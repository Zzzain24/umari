"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

export function FloatingCartButton() {
  const { openCart, totalItems } = useCart()

  if (totalItems === 0) {
    return null
  }

  return (
    <Button
      size="lg"
      onClick={openCart}
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg md:bottom-6 md:right-6 sm:h-16 sm:w-16"
      aria-label={`Shopping cart, ${totalItems} items`}
      aria-expanded={false}
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6" />
        <Badge
          variant="destructive"
          className="absolute -top-3 -right-3 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold"
        >
          {totalItems > 99 ? "99+" : totalItems}
        </Badge>
      </div>
    </Button>
  )
}
