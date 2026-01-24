"use client"

import type { Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Check, RotateCcw } from "lucide-react"

interface ItemActionDropdownProps {
  currentStatus: Order['order_status']
  paymentStatus: Order['payment_status']
  onStatusChange: (status: Order['order_status']) => void
  onRefundItemClick?: () => void
  onRefundOrderClick?: () => void
  disabled?: boolean
  isRefunded?: boolean
  orderRefunded?: boolean
}

const statusOptions: {
  value: Order['order_status']
  label: string
}[] = [
  { value: 'received', label: 'Received' },
  { value: 'ready', label: 'Ready' },
  { value: 'cancelled', label: 'Cancel' },
]

export function ItemActionDropdown({
  currentStatus,
  paymentStatus,
  onStatusChange,
  onRefundItemClick,
  onRefundOrderClick,
  disabled,
  isRefunded = false,
  orderRefunded = false
}: ItemActionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-8 w-full sm:w-auto px-3 text-xs font-medium border-border/60 hover:bg-accent/50"
        >
          Actions
          <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className="flex items-center justify-between text-sm cursor-pointer"
            disabled={isRefunded}
          >
            {option.label}
            {option.value === currentStatus && (
              <Check className="w-3.5 h-3.5 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onRefundItemClick}
          disabled={isRefunded || !onRefundItemClick}
          className="flex items-center gap-2 text-sm cursor-pointer text-destructive focus:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Refund Item
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onRefundOrderClick}
          disabled={orderRefunded || !onRefundOrderClick}
          className="flex items-center gap-2 text-sm cursor-pointer text-destructive focus:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Refund Order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
