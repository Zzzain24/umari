"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { CartItem } from "./cart-item"
import { EditItemDialog } from "./edit-item-dialog"
import type { CartItem as CartItemType } from "@/lib/types"

export function CartSheet() {
  const { cart, isCartOpen, closeCart, subtotal } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const [editingItem, setEditingItem] = useState<CartItemType | null>(null)

  // Get menuId from URL path (/view/[id])
  const menuId = pathname?.split('/view/')[1] || ''

  const handleEdit = (item: CartItemType) => {
    setEditingItem(item)
  }

  const handleCloseEdit = () => {
    setEditingItem(null)
  }

  const handleCheckout = () => {
    closeCart()
    router.push(`/checkout?menuId=${menuId}`)
  }

  return (
    <>
      <Sheet open={isCartOpen} onOpenChange={closeCart}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Your Cart</SheetTitle>
            <SheetDescription>
              {cart.length === 0
                ? "Your cart is empty"
                : `${cart.length} ${cart.length === 1 ? "item" : "items"} in cart`}
            </SheetDescription>
          </SheetHeader>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
              <p className="text-lg text-muted-foreground text-center">
                Your cart is empty
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto -mx-6 px-6">
                <div className="space-y-4 py-4">
                  {cart.map((item) => (
                    <CartItem key={item.id} item={item} onEdit={handleEdit} />
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center justify-around gap-40 text-lg font-semibold">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  disabled={cart.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {editingItem && (
        <EditItemDialog
          item={editingItem}
          isOpen={!!editingItem}
          onClose={handleCloseEdit}
        />
      )}
    </>
  )
}
