import { CartItem, Order } from './types'

/**
 * Derives the order status from individual item statuses
 * Rules:
 * - 'received': At least one item is 'received'
 * - 'ready': All items are 'ready' OR all cancelled
 * - 'cancelled': All items are 'cancelled'
 */
export function deriveOrderStatus(items: CartItem[]): Order['order_status'] {
  if (!items || items.length === 0) {
    return 'received' // Default for empty orders
  }

  const itemStatuses = items.map(item => item.item_status || 'received')

  // All items are cancelled
  if (itemStatuses.every(status => status === 'cancelled')) {
    return 'cancelled'
  }

  // At least one item is received
  if (itemStatuses.some(status => status === 'received')) {
    return 'received'
  }

  // All items are ready (or mix of ready/cancelled with no received)
  return 'ready'
}

/**
 * Gets the effective status for an item
 * Falls back to order status if item doesn't have individual status
 */
export function getItemStatus(
  item: CartItem,
  orderStatus: Order['order_status']
): 'received' | 'ready' | 'cancelled' {
  return item.item_status || orderStatus
}

/**
 * Gets a category label name
 * Returns the label name if provided, otherwise 'Uncategorized'
 */
export function getCategoryLabel(labelName?: string | null): string {
  return labelName || 'Uncategorized'
}

/**
 * Groups items by order while maintaining item separation
 * Returns array of {order, item, isFirstItemInOrder}
 */
export function flattenOrdersToItems(orders: Order[]): Array<{
  order: Order
  item: CartItem
  isFirstItemInOrder: boolean
}> {
  return orders.flatMap(order =>
    order.items.map((item, index) => ({
      order,
      item,
      isFirstItemInOrder: index === 0,
    }))
  )
}

/**
 * Determines if an order should appear in "Active Orders" section
 * Active = at least one item has 'received' status
 */
export function isActiveOrder(order: Order): boolean {
  return order.items.some(item => {
    const status = getItemStatus(item, order.order_status)
    return status === 'received'
  })
}

/**
 * Determines if an order should appear in "Ready for Pickup" section
 * Ready = all items are 'ready' or 'cancelled', with at least one 'ready'
 */
export function isReadyOrder(order: Order): boolean {
  const itemStatuses = order.items.map(item => getItemStatus(item, order.order_status))

  const hasReady = itemStatuses.some(status => status === 'ready')
  const allReadyOrCancelled = itemStatuses.every(
    status => status === 'ready' || status === 'cancelled'
  )

  return hasReady && allReadyOrCancelled
}
