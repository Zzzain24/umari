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

/**
 * Interface for grouped items by label
 */
export interface GroupedItems {
  labelName: string          // "Coffee" or "Uncategorized"
  labelColor: string         // Hex color
  items: Array<{
    order: Order
    item: CartItem
    isFirstItemInOrder: boolean
  }>
}

/**
 * Groups items by their label_name
 * Returns array of groups sorted alphabetically, with "Uncategorized" last
 */
export function groupItemsByLabel(
  flattenedItems: ReturnType<typeof flattenOrdersToItems>
): GroupedItems[] {
  // Group items by label_name
  const groups = new Map<string, GroupedItems>()

  flattenedItems.forEach(({ order, item, isFirstItemInOrder }) => {
    const labelName = item.label_name || 'Uncategorized'
    const labelColor = item.label_color || '#9CA3AF'

    if (!groups.has(labelName)) {
      groups.set(labelName, { labelName, labelColor, items: [] })
    }

    groups.get(labelName)!.items.push({ order, item, isFirstItemInOrder })
  })

  // Convert to array and sort alphabetically, with "Uncategorized" last
  const groupsArray = Array.from(groups.values())
  groupsArray.sort((a, b) => {
    if (a.labelName === 'Uncategorized') return 1
    if (b.labelName === 'Uncategorized') return -1
    return a.labelName.localeCompare(b.labelName)
  })

  return groupsArray
}
