"use client"

import { useState } from "react"
import type { Order, CartItem } from "@/lib/types"
import { ItemActionDropdown } from "./item-action-dropdown"
import { CustomerPopover } from "./customer-popover"
import { RefundConfirmationDialog } from "./refund-confirmation-dialog"
import { formatDistanceToNow } from "date-fns"
import { getItemStatus } from "@/lib/order-utils"

interface OrderItemCardProps {
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

export function OrderItemCard({
  order,
  item,
  isFirstItemInOrder,
  onStatusChange,
  onRefund
}: OrderItemCardProps) {
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
          <CustomerPopover
            name={order.customer_name}
            email={order.customer_email}
            phone={order.customer_phone}
          />
        </div>

        <div className="py-1.5 border-b border-border/30">
          <span className="text-sm text-muted-foreground mb-2 block">Item</span>
          <div className="flex flex-col gap-1.5">
            {/* Item name with color dot */}
            <div className="flex items-center gap-2">
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
              <div className="flex flex-col gap-0.5 ml-4.5">
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
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-border/30">
          <span className="text-sm text-muted-foreground">Item Price</span>
          <span className="text-sm font-semibold text-foreground">
            {formatCurrency(item.totalPrice)}
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5">
          <span className="text-sm text-muted-foreground">Date</span>
          <span className="text-sm text-muted-foreground">{timeAgo} ago</span>
        </div>
      </div>

      {/* Footer - Actions */}
      <div className="px-5 py-3 border-t border-border/40 flex items-center justify-center sm:justify-start">
        <div className="flex-1 sm:flex-none">
          <ItemActionDropdown
            currentStatus={itemStatus}
            paymentStatus={order.payment_status}
            onStatusChange={(newStatus) => onStatusChange(order.id, item.id, newStatus)}
            onRefundClick={onRefund ? handleRefundClick : undefined}
            disabled={isRefunding}
          />
        </div>
      </div>

      <RefundConfirmationDialog
        open={isRefundDialogOpen}
        onOpenChange={setIsRefundDialogOpen}
        onConfirm={handleRefundConfirm}
        orderTotal={item.totalPrice}
        platformFee={0}
        isLoading={isRefunding}
      />
    </div>
  )
}
