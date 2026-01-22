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

interface OrderActionsDropdownProps {
  currentStatus: Order['order_status']
  paymentStatus: Order['payment_status']
  onStatusChange: (status: Order['order_status']) => void
  onRefundClick?: () => void
  disabled?: boolean
}

const statusOptions: {
  value: Order['order_status']
  label: string
}[] = [
  { value: 'received', label: 'Received' },
  { value: 'ready', label: 'Ready' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function OrderActionsDropdown({
  currentStatus,
  paymentStatus,
  onStatusChange,
  onRefundClick,
  disabled
}: OrderActionsDropdownProps) {
  const canRefund = paymentStatus === 'succeeded' && currentStatus !== 'cancelled' && onRefundClick

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
            disabled={option.value === currentStatus}
          >
            {option.label}
            {option.value === currentStatus && (
              <Check className="w-3.5 h-3.5 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        {canRefund && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onRefundClick}
              className="flex items-center gap-2 text-sm cursor-pointer text-destructive focus:text-destructive"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Refund Order
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
