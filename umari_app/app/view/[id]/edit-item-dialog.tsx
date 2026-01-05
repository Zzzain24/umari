"use client"

import { useState, useEffect, useMemo } from "react"
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
import { calculateItemPrice, validateRequiredOptions } from "@/lib/cart-utils"
import type { CartItem, SelectedOption } from "@/lib/types"
import { QuantitySelector } from "./quantity-selector"
import { MenuItemOptions } from "./menu-item-options"

interface EditItemDialogProps {
  item: CartItem
  isOpen: boolean
  onClose: () => void
}

export function EditItemDialog({ item, isOpen, onClose }: EditItemDialogProps) {
  const { updateCartItem, getMenuItem } = useCart()
  const [quantity, setQuantity] = useState(item.quantity)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>(
    item.selectedOptions
  )

  // Get the full menu item with all available options
  const menuItem = getMenuItem(item.menuItemId)

  // Reset local state when item changes
  useEffect(() => {
    setQuantity(item.quantity)
    setSelectedOptions(item.selectedOptions)
  }, [item])

  // Validate that all required options are selected
  const isValid = useMemo(() => {
    if (!menuItem?.options || menuItem.options.length === 0) {
      return true
    }
    return validateRequiredOptions(menuItem.options, selectedOptions)
  }, [menuItem?.options, selectedOptions])

  const totalPrice = calculateItemPrice(item.basePrice, selectedOptions, quantity)

  const handleSave = () => {
    if (!isValid) {
      return
    }
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
          {/* Options Selector */}
          {menuItem?.options && menuItem.options.length > 0 && (
            <MenuItemOptions
              options={menuItem.options}
              selectedOptions={selectedOptions}
              onChange={setSelectedOptions}
            />
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Quantity</p>
            <QuantitySelector quantity={quantity} onChange={setQuantity} />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-base font-medium">Total</span>
            <span className="text-2xl font-bold">${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {!isValid ? "Select required options" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
