"use client"

import { Package } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

interface OrdersEmptyProps {
  dateRange?: DateRange
}

export function OrdersEmpty({ dateRange }: OrdersEmptyProps) {
  const hasDateFilter = dateRange?.from || dateRange?.to

  return (
    <div className="bg-card rounded-xl border border-border/60 p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Package className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium text-foreground mb-1">
          No orders found
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {hasDateFilter ? (
            <>
              No orders between{" "}
              {dateRange?.from && format(dateRange.from, "MMM d")}
              {dateRange?.to && ` - ${format(dateRange.to, "MMM d, yyyy")}`}
            </>
          ) : (
            "Orders will appear here when customers place them"
          )}
        </p>
      </div>
    </div>
  )
}
