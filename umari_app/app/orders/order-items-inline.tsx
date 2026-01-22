"use client"

import type { CartItem } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"

interface OrderItemsInlineProps {
  items: CartItem[]
  maxVisibleItems?: number
}

export function OrderItemsInline({ items, maxVisibleItems }: OrderItemsInlineProps) {
  const isMobile = useIsMobile()

  // On mobile, show all items. On desktop, limit to maxVisibleItems (default 3)
  const visibleLimit = isMobile ? items.length : (maxVisibleItems ?? 3)
  const visibleItems = items.slice(0, visibleLimit)
  const remainingCount = items.length - visibleItems.length

  return (
    <div className="max-w-[320px] space-y-2">
      {visibleItems.map((item, index) => (
        <div key={item.id || index} className="space-y-0.5">
          {/* Item name with color dot and quantity */}
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: item.label_color || '#9CA3AF' }}
            />
            <span className="text-sm font-medium text-foreground">
              {item.quantity}x {item.itemName}
            </span>
          </div>

          {/* Customizations (all options shown) */}
          {item.selectedOptions && item.selectedOptions.length > 0 && (
            <div className="pl-4">
              <p className="text-xs text-muted-foreground">
                {item.selectedOptions
                  .map(option => `${option.optionName}: ${option.selectedValue}`)
                  .join(' • ')}
              </p>
            </div>
          )}

          {/* Special instructions */}
          {item.specialInstructions && (
            <div className="pl-4">
              <p className="text-xs text-muted-foreground italic">
                Note: {item.specialInstructions}
              </p>
            </div>
          )}
        </div>
      ))}

      {/* Show remaining items count on desktop */}
      {remainingCount > 0 && (
        <div className="pl-4">
          <p className="text-xs text-muted-foreground">
            +{remainingCount} more item{remainingCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
