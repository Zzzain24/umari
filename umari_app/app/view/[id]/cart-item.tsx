"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import type { CartItem as CartItemType } from "@/lib/types"

interface CartItemProps {
  item: CartItemType
  onEdit: (item: CartItemType) => void
}

export function CartItem({ item, onEdit }: CartItemProps) {
  const { removeFromCart } = useCart()

  return (
    <div className="flex flex-col gap-3 p-4 bg-white border border-secondary/40 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{item.itemName}</h4>
          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
        </div>
        <p className="font-semibold text-foreground">
          ${item.totalPrice.toFixed(2)}
        </p>
      </div>

      {/* Selected Options */}
      {item.selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {item.selectedOptions.map((option, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {option.optionName}: {option.selectedValue}
              {option.additionalPrice > 0 && (
                <span className="ml-1">+${option.additionalPrice.toFixed(2)}</span>
              )}
              {option.additionalPrice < 0 && (
                <span className="ml-1">-${Math.abs(option.additionalPrice).toFixed(2)}</span>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Special Instructions */}
      {item.specialInstructions && (
        <p className="text-xs text-muted-foreground italic">
          Note: {item.specialInstructions}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onEdit(item)}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Pencil className="h-3.5 w-3.5 mr-2" />
          Edit
        </Button>
        <Button
          size="sm"
          onClick={() => removeFromCart(item.id)}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Trash2 className="h-3.5 w-3.5 mr-2" />
          Remove
        </Button>
      </div>
    </div>
  )
}
