"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { MenuItemOptions } from "./menu-item-options"
import { QuantitySelector } from "./quantity-selector"
import { calculateItemPrice, validateRequiredOptions } from "@/lib/cart-utils"
import type { SelectedOption } from "@/lib/types"

interface MenuItemViewProps {
  item: {
    id: string
    name: string
    price: number
    options?: Array<{
      id: string
      name: string
      options: Array<{ value: string; price?: number }>
      is_required: boolean
    }>
  }
}

export function MenuItemView({ item }: MenuItemViewProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([])

  // Validate that all required options are selected
  const isValid = useMemo(() => {
    if (!item.options || item.options.length === 0) {
      return true
    }
    return validateRequiredOptions(item.options, selectedOptions)
  }, [item.options, selectedOptions])

  // Calculate total price (base + options) * quantity
  const totalPrice = useMemo(() => {
    return calculateItemPrice(item.price, selectedOptions, quantity)
  }, [item.price, selectedOptions, quantity])

  const handleAddToCart = () => {
    addToCart({
      menuItemId: item.id,
      itemName: item.name,
      basePrice: item.price,
      quantity,
      selectedOptions,
      totalPrice,
    })

    // Reset quantity and optionally keep or reset options
    setQuantity(1)
    // Optionally reset options: setSelectedOptions([])
  }

  return (
    <div className="border-b border-border pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-1">
            {item.name}
          </h3>
          <p className="text-base text-muted-foreground">
            ${item.price.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Options Selector */}
      {item.options && item.options.length > 0 && (
        <MenuItemOptions
          options={item.options}
          selectedOptions={selectedOptions}
          onChange={setSelectedOptions}
        />
      )}

      {/* Quantity Selector and Add to Cart */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Quantity</p>
            <QuantitySelector quantity={quantity} onChange={setQuantity} />
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-2">Total</p>
            <p className="text-2xl font-bold text-foreground">
              ${totalPrice.toFixed(2)}
            </p>
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={!isValid}
          className="w-full"
          size="lg"
        >
          {!isValid ? "Select required options" : "Add to Cart"}
        </Button>
      </div>
    </div>
  )
}
