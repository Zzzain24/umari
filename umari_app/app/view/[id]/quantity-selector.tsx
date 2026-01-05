"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

interface QuantitySelectorProps {
  quantity: number
  onChange: (quantity: number) => void
  min?: number
  max?: number
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max,
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (quantity > min) {
      onChange(quantity - 1)
    }
  }

  const handleIncrease = () => {
    if (!max || quantity < max) {
      onChange(quantity + 1)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrease}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
        className="h-9 w-9"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <span className="text-base font-medium min-w-[2rem] text-center">
        {quantity}
      </span>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrease}
        disabled={max !== undefined && quantity >= max}
        aria-label="Increase quantity"
        className="h-9 w-9"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
