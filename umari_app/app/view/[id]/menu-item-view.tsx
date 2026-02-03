"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/contexts/cart-context"
import { MenuItemOptions } from "./menu-item-options"
import { QuantitySelector } from "./quantity-selector"
import { calculateItemPrice, validateRequiredOptions } from "@/lib/cart-utils"
import { cn } from "@/lib/utils"
import type { SelectedOption } from "@/lib/types"

interface MenuItemViewProps {
  item: {
    id: string
    name: string
    price: number
    is_sold_out?: boolean
    allow_special_instructions?: boolean
    label_color?: string
    label_name?: string | null
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
  const [quantity, setQuantity] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([])
  const [specialInstructions, setSpecialInstructions] = useState("")

  // Validate that all required options are selected and item is not sold out
  const isValid = useMemo(() => {
    if (item.is_sold_out) {
      return false
    }
    if (quantity === 0) {
      return false
    }
    if (!item.options || item.options.length === 0) {
      return true
    }
    return validateRequiredOptions(item.options, selectedOptions)
  }, [item.options, item.is_sold_out, selectedOptions, quantity])

  // Calculate options price separately
  const optionsPrice = useMemo(() => {
    return selectedOptions.reduce((sum, opt) => sum + opt.additionalPrice, 0)
  }, [selectedOptions])

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
      optionsPrice,
      totalPrice,
      specialInstructions: specialInstructions.trim() || undefined,
      label_color: item.label_color || '#9CA3AF',
      label_name: item.label_name || undefined,
    })

    // Reset quantity and special instructions
    setQuantity(0)
    setSpecialInstructions("")
  }

  return (
    <div className={cn(
      "border-b border-border pb-6 last:border-b-0 last:pb-0",
      item.is_sold_out && "opacity-60"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-semibold text-foreground">
              {item.name}
            </h3>
            {item.is_sold_out && (
              <Badge variant="destructive">Sold Out</Badge>
            )}
          </div>
          <p className={cn(
            "text-base text-muted-foreground",
            item.is_sold_out && "line-through"
          )}>
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
            <QuantitySelector quantity={quantity} onChange={setQuantity} min={0} />
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-2">Price</p>
            <p className="text-2xl font-bold text-foreground">
              ${(item.price + optionsPrice).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Special Instructions - Only show if allowed */}
        {(item.allow_special_instructions ?? true) && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Special Instructions (optional)</p>
            <Textarea
              placeholder="E.g., extra hot, light ice..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="resize-none h-20"
              maxLength={200}
            />
          </div>
        )}

        <Button
          onClick={handleAddToCart}
          disabled={!isValid}
          className="w-full"
          size="lg"
        >
          {item.is_sold_out
            ? "Sold Out"
            : quantity === 0
              ? "Select quantity"
              : !isValid
                ? "Select required options"
                : "Add to Cart"
          }
        </Button>
      </div>
    </div>
  )
}
