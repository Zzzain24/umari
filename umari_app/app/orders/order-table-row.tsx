"use client"

import { useState } from "react"
import type { Order } from "@/lib/types"
import { OrderActionsDropdown } from "./order-actions-dropdown"
import { OrderItemsInline } from "./order-items-inline"
import { CustomerPopover } from "./customer-popover"
import { RefundConfirmationDialog } from "./refund-confirmation-dialog"
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
        <OrderItemsInline items={order.items} maxVisibleItems={3} />
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
        <OrderActionsDropdown
          currentStatus={order.order_status}
          paymentStatus={order.payment_status}
          onStatusChange={(newStatus) => onStatusChange(order.id, newStatus)}
          onRefundClick={onRefund ? handleRefundClick : undefined}
          disabled={isRefunding}
        />
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
