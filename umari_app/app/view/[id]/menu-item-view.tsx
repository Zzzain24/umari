"use client"

import type React from "react"
import { Separator } from "@/components/ui/separator"

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
  return (
    <div className="border-b border-border pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-1">
            {item.name}
          </h3>
          {item.options && item.options.length > 0 && (
            <div className="space-y-3 mt-4">
              {item.options.map((option) => (
                <div key={option.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {option.name}
                    </span>
                    {option.is_required && (
                      <span className="text-xs text-primary font-medium">
                        (Required)
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 ml-4">
                    {option.options.map((optValue, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span>{optValue.value}</span>
                        {optValue.price !== undefined && optValue.price > 0 && (
                          <span className="text-foreground font-medium">
                            +${optValue.price.toFixed(2)}
                          </span>
                        )}
                        {idx < option.options.length - 1 && (
                          <span className="text-muted-foreground">•</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="ml-4">
          <span className="text-xl font-semibold text-foreground">
            ${item.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}

