"use client"

import type { Order } from "@/lib/types"
import { OrderStatusDropdown } from "./order-status-dropdown"
import { formatDistanceToNow } from "date-fns"

interface OrderTableRowProps {
  order: Order
  onStatusChange: (orderId: string, newStatus: Order['order_status']) => void
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

export function OrderTableRow({ order, onStatusChange }: OrderTableRowProps) {
  const status = statusConfig[order.order_status]
  const createdAt = new Date(order.created_at)
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: false })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Get first item for summary
  const firstItem = order.items[0]
  const itemsSummary = firstItem ? `${firstItem.quantity}x ${firstItem.itemName}` : ''
  const remainingItems = order.items.length > 1 ? order.items.length - 1 : 0

  return (
    <tr className="border-b border-border/40 hover:bg-accent/30 transition-colors">
      <td className="px-4 py-3.5">
        <span className="text-sm font-medium text-foreground">
          #{order.order_number}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-sm text-foreground">
          {order.customer_name || 'Guest'}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {itemsSummary}{remainingItems > 0 && ` +${remainingItems}`}
        </span>
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
        <OrderStatusDropdown
          currentStatus={order.order_status}
          onStatusChange={(newStatus) => onStatusChange(order.id, newStatus)}
        />
      </td>
    </tr>
  )
}
