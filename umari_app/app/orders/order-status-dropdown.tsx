"use client"

import type { Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Check } from "lucide-react"

interface OrderStatusDropdownProps {
  currentStatus: Order['order_status']
  onStatusChange: (status: Order['order_status']) => void
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

export function OrderStatusDropdown({
  currentStatus,
  onStatusChange,
  disabled
}: OrderStatusDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-8 px-3 text-xs font-medium border-border/60 hover:bg-accent/50"
        >
          Update
          <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[140px]">
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
