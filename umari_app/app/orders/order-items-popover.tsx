"use client"

import type { CartItem } from "@/lib/types"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"

interface OrderItemsPopoverProps {
  items: CartItem[]
}

export function OrderItemsPopover({ items }: OrderItemsPopoverProps) {
  const isMobile = useIsMobile()
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Create summary text for trigger
  const firstItem = items[0]
  const summaryText = firstItem
    ? `${firstItem.quantity}x ${firstItem.itemName}${items.length > 1 ? ` +${items.length - 1}` : ''}`
    : 'No items'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-sm text-foreground text-left truncate max-w-[200px] underline underline-offset-2">
          {summaryText}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        align={isMobile ? "center" : "start"} 
        side={isMobile ? "bottom" : "right"}
        collisionPadding={isMobile ? 16 : 8}
        className="w-80 max-w-[calc(100vw-32px)] sm:max-w-none"
      >
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground mb-3">
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </p>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id || index} className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {item.quantity}x {item.itemName}
                  </span>
                  <span className="text-sm text-foreground shrink-0">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <div className="pl-4 space-y-0.5">
                    {item.selectedOptions.map((option, optIndex) => (
                      <p key={optIndex} className="text-xs text-muted-foreground">
                        • {option.optionName}: {option.selectedValue}
                        {option.additionalPrice > 0 && (
                          <span className="text-muted-foreground/70">
                            {' '}(+{formatCurrency(option.additionalPrice)})
                          </span>
                        )}
                      </p>
                    ))}
                  </div>
                )}
                {item.specialInstructions && (
                  <p className="text-xs text-muted-foreground italic pl-4 mt-1">
                    Note: {item.specialInstructions}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
