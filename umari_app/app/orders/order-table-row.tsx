"use client"

import { useState } from "react"
import type { Order } from "@/lib/types"
import { OrderStatusDropdown } from "./order-status-dropdown"
import { OrderItemsPopover } from "./order-items-popover"
import { CustomerPopover } from "./customer-popover"
import { RefundConfirmationDialog } from "./refund-confirmation-dialog"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface OrderTableRowProps {
  order: Order
  onStatusChange: (orderId: string, newStatus: Order['order_status']) => void
  onRefund?: (orderId: string) => void
}

const statusConfig: Record<Order['order_status'], {
  label: string
  className: string
}> = {
  received: {
    label: 'Received',
    className: 'bg-warning/15 text-warning'
  },
  ready: {
    label: 'Ready',
    className: 'bg-success/15 text-success'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-destructive/15 text-destructive'
  },
}

export function OrderTableRow({ order, onStatusChange, onRefund }: OrderTableRowProps) {
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [isRefunding, setIsRefunding] = useState(false)
  const status = statusConfig[order.order_status]
  const createdAt = new Date(order.created_at)
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: false })
  
  const canRefund = order.payment_status === 'succeeded' && order.order_status !== 'cancelled'

  const handleRefundClick = () => {
    setIsRefundDialogOpen(true)
  }

  const handleRefundConfirm = async () => {
    if (!onRefund) return
    
    setIsRefunding(true)
    try {
      await onRefund(order.id)
      setIsRefundDialogOpen(false)
    } finally {
      setIsRefunding(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <tr className="border-b border-border/40 hover:bg-accent/30 transition-colors">
      <td className="px-4 py-3.5">
        <span className="text-sm font-medium text-foreground">
          #{order.order_number}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <CustomerPopover
          name={order.customer_name}
          email={order.customer_email}
          phone={order.customer_phone}
        />
      </td>
      <td className="px-4 py-3.5">
        <OrderItemsPopover items={order.items} />
      </td>
      <td className="px-4 py-3.5">
        <span className="text-sm font-medium text-foreground">
          {formatCurrency(order.total)}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-sm text-muted-foreground">
          {timeAgo} ago
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <OrderStatusDropdown
            currentStatus={order.order_status}
            onStatusChange={(newStatus) => onStatusChange(order.id, newStatus)}
          />
          {canRefund && onRefund && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefundClick}
              className="h-8 px-3 text-xs font-medium border-destructive/50 text-destructive hover:bg-destructive/10"
              disabled={isRefunding}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Refund
            </Button>
          )}
        </div>
      </td>
      <RefundConfirmationDialog
        open={isRefundDialogOpen}
        onOpenChange={setIsRefundDialogOpen}
        onConfirm={handleRefundConfirm}
        orderTotal={order.total}
        platformFee={order.platform_fee}
        isLoading={isRefunding}
      />
    </tr>
  )
}
