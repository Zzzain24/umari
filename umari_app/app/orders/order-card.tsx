"use client"

import type { Order, CartItem } from "@/lib/types"
import { OrderStatusDropdown } from "./order-status-dropdown"
import { formatDistanceToNow } from "date-fns"

interface OrderCardProps {
  order: Order
  onStatusChange: (orderId: string, newStatus: Order['order_status']) => void
}

const statusConfig: Record<Order['order_status'], {
  label: string
  className: string
}> = {
  received: {
    label: 'Received',
    className: 'bg-warning/15 text-warning border border-warning/30'
  },
  ready: {
    label: 'Ready',
    className: 'bg-success/15 text-success border border-success/30'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-destructive/15 text-destructive border border-destructive/30'
  },
}

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const status = statusConfig[order.order_status]
  const createdAt = new Date(order.created_at)
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: false })

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Get first 2 items for summary
  const itemsSummary = order.items.slice(0, 2).map(item =>
    `${item.quantity}x ${item.itemName}`
  ).join(', ')
  const remainingItems = order.items.length > 2 ? order.items.length - 2 : 0

  return (
    <div className="bg-card rounded-xl border border-border/60 hover:border-border transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
        <span className="text-base font-semibold text-foreground">
          #{order.order_number}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
      </div>

      {/* Content - Key Value Pairs */}
      <div className="px-5 py-3 space-y-3">
        <div className="flex justify-between items-center py-1.5 border-b border-border/30">
          <span className="text-sm text-muted-foreground">Customer</span>
          <span className="text-sm font-medium text-foreground">
            {order.customer_name || 'Guest'}
          </span>
        </div>

        {order.customer_phone && (
          <div className="flex justify-between items-center py-1.5 border-b border-border/30">
            <span className="text-sm text-muted-foreground">Phone</span>
            <span className="text-sm text-foreground">{order.customer_phone}</span>
          </div>
        )}

        <div className="flex justify-between items-center py-1.5 border-b border-border/30">
          <span className="text-sm text-muted-foreground">Items</span>
          <span className="text-sm text-foreground text-right max-w-[60%] truncate">
            {itemsSummary}{remainingItems > 0 && ` +${remainingItems} more`}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-border/30">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-sm font-semibold text-foreground">
            {formatCurrency(order.total)}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5">
          <span className="text-sm text-muted-foreground">Date</span>
          <span className="text-sm text-muted-foreground">{timeAgo} ago</span>
        </div>
      </div>

      {/* Footer - Status Update */}
      <div className="px-5 py-3 border-t border-border/40">
        <OrderStatusDropdown
          currentStatus={order.order_status}
          onStatusChange={(newStatus) => onStatusChange(order.id, newStatus)}
        />
      </div>
    </div>
  )
}
