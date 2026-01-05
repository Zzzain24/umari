"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { calculateItemPrice } from "@/lib/cart-utils"
import type { CartItem, SelectedOption } from "@/lib/types"
import { QuantitySelector } from "./quantity-selector"

interface EditItemDialogProps {
  item: CartItem
  isOpen: boolean
  onClose: () => void
}

export function EditItemDialog({ item, isOpen, onClose }: EditItemDialogProps) {
  const { updateCartItem } = useCart()
  const [quantity, setQuantity] = useState(item.quantity)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>(
    item.selectedOptions
  )

  // Reset local state when item changes
  useEffect(() => {
    setQuantity(item.quantity)
    setSelectedOptions(item.selectedOptions)
  }, [item])

  const totalPrice = calculateItemPrice(item.basePrice, selectedOptions, quantity)

  const handleSave = () => {
    updateCartItem(item.id, {
      quantity,
      selectedOptions,
      totalPrice,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>{item.itemName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Note: For full option editing, we'd need to recreate MenuItemOptions here
              with the original menu item options structure. For now, we'll just allow
              quantity editing. To fully implement option editing, we'd need to pass
              the original menu item structure to the cart or fetch it here. */}

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Quantity</p>
            <QuantitySelector quantity={quantity} onChange={setQuantity} />
          </div>

          {/* Display selected options (read-only for now) */}
          {selectedOptions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Selected Options</p>
              <div className="space-y-1">
                {selectedOptions.map((option, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground">
                    {option.optionName}: {option.selectedValue}
                    {option.additionalPrice > 0 && (
                      <span className="ml-2">+${option.additionalPrice.toFixed(2)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-base font-medium">Total</span>
            <span className="text-2xl font-bold">${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
