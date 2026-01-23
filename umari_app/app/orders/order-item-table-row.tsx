"use client"

import { useState } from "react"
import type { Order, CartItem } from "@/lib/types"
import { ItemActionDropdown } from "./item-action-dropdown"
import { CustomerPopover } from "./customer-popover"
import { RefundConfirmationDialog } from "./refund-confirmation-dialog"
import { formatDistanceToNow } from "date-fns"
import { getItemStatus } from "@/lib/order-utils"

interface OrderItemTableRowProps {
  order: Order
  item: CartItem
  isFirstItemInOrder: boolean
  onStatusChange: (orderId: string, itemId: string, newStatus: Order['order_status']) => void
  onRefund?: (orderId: string, itemId: string) => void
}

const statusConfig: Record<'received' | 'ready' | 'cancelled', {
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

export function OrderItemTableRow({
  order,
  item,
  isFirstItemInOrder,
  onStatusChange,
  onRefund
}: OrderItemTableRowProps) {
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [isRefunding, setIsRefunding] = useState(false)
  const itemStatus = getItemStatus(item, order.order_status)
  const status = statusConfig[itemStatus]
  const createdAt = new Date(order.created_at)
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: false })

  const handleRefundClick = () => {
    setIsRefundDialogOpen(true)
  }

  const handleRefundConfirm = async () => {
    if (!onRefund) return

    setIsRefunding(true)
    try {
      await onRefund(order.id, item.id)
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
      {/* Order ID */}
      <td className="px-4 py-3.5">
        <span className="text-sm font-medium text-foreground">
          #{order.order_number}
        </span>
      </td>

      {/* Customer */}
      <td className="px-4 py-3.5">
        <CustomerPopover
          name={order.customer_name}
          email={order.customer_email}
          phone={order.customer_phone}
        />
      </td>

      {/* Item Details */}
      <td className="px-4 py-3.5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {/* Color dot */}
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.label_color || '#9CA3AF' }}
            />
            <span className="text-sm font-medium text-foreground">
              {item.quantity}x {item.itemName}
            </span>
          </div>

          {/* Options */}
          {item.selectedOptions && item.selectedOptions.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 ml-4.5">
              {item.selectedOptions.map((option, index) => (
                <span key={index} className="text-xs text-muted-foreground">
                  • {option.optionName}: {option.selectedValue}
                </span>
              ))}
            </div>
          )}

          {/* Special Instructions */}
          {item.specialInstructions && (
            <div className="ml-4.5">
              <span className="text-xs text-muted-foreground italic">
                Note: {item.specialInstructions}
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Item Price */}
      <td className="px-4 py-3.5">
        <span className="text-sm font-medium text-foreground">
          {formatCurrency(item.totalPrice)}
        </span>
      </td>

      {/* Date */}
      <td className="px-4 py-3.5">
        <span className="text-sm text-muted-foreground">
          {timeAgo} ago
        </span>
      </td>

      {/* Item Status */}
      <td className="px-4 py-3.5">
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
      </td>

      {/* Item Actions */}
      <td className="px-4 py-3.5">
        <ItemActionDropdown
          currentStatus={itemStatus}
          paymentStatus={order.payment_status}
          onStatusChange={(newStatus) => onStatusChange(order.id, item.id, newStatus)}
          onRefundClick={onRefund ? handleRefundClick : undefined}
          disabled={isRefunding}
          isRefunded={!!item.refunded_amount}
        />
      </td>
      <RefundConfirmationDialog
        open={isRefundDialogOpen}
        onOpenChange={setIsRefundDialogOpen}
        onConfirm={handleRefundConfirm}
        orderTotal={item.totalPrice}
        platformFee={0}
        isLoading={isRefunding}
      />
    </tr>
  )
}
