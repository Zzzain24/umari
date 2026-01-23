"use client"

import type { Order } from "@/lib/types"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OrderItemCard } from "./order-item-card"
import { OrderItemTableRow } from "./order-item-table-row"
import { OrdersEmpty } from "./orders-empty"
import { DateRangePicker } from "./date-range-picker"
import { OrderFilterPopover } from "./order-filter-popover"
import { OrderSkeleton, OrderTableRowSkeleton } from "./order-skeleton"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw, Search } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { createClient } from "@/lib/supabase/client"
import {
  flattenOrdersToItems,
  isActiveOrder,
  isReadyOrder,
  deriveOrderStatus,
  getItemStatus
} from "@/lib/order-utils"

interface OrdersListProps {
  initialOrders: Order[]
  userId: string
}

export function OrdersList({ initialOrders, userId }: OrdersListProps) {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  })
  const [statusFilter, setStatusFilter] = useState<('received' | 'ready' | 'cancelled')[]>([])
  const [labelFilter, setLabelFilter] = useState<string[]>([])

  // Extract unique label names from all orders
  const availableLabels = useMemo(() => {
    const labelMap = new Map<string, { name: string; color: string }>()
    orders.forEach(order =>
      order.items.forEach(item => {
        const labelName = item.label_name || 'Uncategorized'
        const labelColor = item.label_color || '#9CA3AF'
        if (!labelMap.has(labelName)) {
          labelMap.set(labelName, { name: labelName, color: labelColor })
        }
      })
    )
    return Array.from(labelMap.values())
  }, [orders])

  // Filter orders by search query and separate into active/ready sections
  const { activeItems, readyItems, totalItemCount } = useMemo(() => {
    // First, filter orders by search query
    const query = searchQuery.toLowerCase().trim()
    const searchFilteredOrders = query
      ? orders.filter(order =>
          order.order_number.toLowerCase().includes(query) ||
          (order.customer_name?.toLowerCase().includes(query) ?? false)
        )
      : orders

    // Separate into active and ready orders
    const active = searchFilteredOrders.filter(isActiveOrder)
    const ready = searchFilteredOrders.filter(isReadyOrder)

    // Flatten to items
    const activeItemsFlat = flattenOrdersToItems(active)
    const readyItemsFlat = flattenOrdersToItems(ready)

    // Apply item-level filters
    const filterItems = (items: ReturnType<typeof flattenOrdersToItems>) => {
      return items.filter(({ order, item }) => {
        const itemStatus = getItemStatus(item, order.order_status)
        const statusMatch = statusFilter.length === 0 || statusFilter.includes(itemStatus)
        const labelMatch = labelFilter.length === 0 || labelFilter.includes(item.label_name || 'Uncategorized')
        return statusMatch && labelMatch
      })
    }

    const filteredActive = filterItems(activeItemsFlat)
    const filteredReady = filterItems(readyItemsFlat)

    return {
      activeItems: filteredActive,
      readyItems: filteredReady,
      totalItemCount: filteredActive.length + filteredReady.length
    }
  }, [orders, searchQuery, statusFilter, labelFilter])

  const handleDateRangeChange = async (range: DateRange | undefined) => {
    setDateRange(range)
    if (!range?.from) return

    setIsLoading(true)
    try {
      const supabase = createClient()

      const endDate = range.to ? new Date(range.to) : new Date()
      endDate.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('business_user_id', userId)
        .gte('created_at', range.from.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch orders",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: Order['order_status']) => {
    const previousOrders = orders
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, order_status: newStatus, updated_at: new Date().toISOString() }
        : order
    ))

    try {
      const response = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, newStatus }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Status updated",
          description: `Order marked as ${newStatus}`,
        })
      } else {
        setOrders(previousOrders)
        toast({
          title: "Error",
          description: result.error || "Failed to update status",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      setOrders(previousOrders)
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive"
      })
    }
  }

  const handleRefresh = () => {
    handleDateRangeChange(dateRange)
  }

  const handleRefund = async (orderId: string) => {
    const previousOrders = orders
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? {
            ...order,
            payment_status: 'refunded',
            order_status: 'cancelled',
            updated_at: new Date().toISOString()
          }
        : order
    ))

    try {
      const response = await fetch('/api/orders/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Order refunded",
          description: "The order has been refunded and the Umari fee has been reimbursed.",
        })
      } else {
        setOrders(previousOrders)
        toast({
          title: "Error",
          description: result.error || "Failed to refund order",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      setOrders(previousOrders)
      toast({
        title: "Error",
        description: error.message || "Failed to refund order",
        variant: "destructive"
      })
    }
  }

  // Empty state - no orders in date range
  if (orders.length === 0 && !isLoading) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header
          itemCount={0}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onRefresh={handleRefresh}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          labelFilter={labelFilter}
          availableLabels={availableLabels}
          onStatusFilterChange={setStatusFilter}
          onLabelFilterChange={setLabelFilter}
          onClearFilters={() => {
            setStatusFilter([])
            setLabelFilter([])
          }}
        />
        <div className="mt-8">
          <OrdersEmpty dateRange={dateRange} />
        </div>
      </main>
    )
  }

  // Empty state - no search/filter results
  if (totalItemCount === 0 && (searchQuery.trim() || statusFilter.length > 0 || labelFilter.length > 0)) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header
          itemCount={0}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onRefresh={handleRefresh}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          labelFilter={labelFilter}
          availableLabels={availableLabels}
          onStatusFilterChange={setStatusFilter}
          onLabelFilterChange={setLabelFilter}
          onClearFilters={() => {
            setStatusFilter([])
            setLabelFilter([])
          }}
        />
        <div className="mt-8 text-center py-12">
          <p className="text-muted-foreground">
            No items found {searchQuery.trim() && `matching "${searchQuery}"`}
          </p>
          <Button
            variant="link"
            onClick={() => {
              setSearchQuery("")
              setStatusFilter([])
              setLabelFilter([])
            }}
            className="mt-2"
          >
            Clear filters
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Header
        itemCount={totalItemCount}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onRefresh={handleRefresh}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={isLoading}
        statusFilter={statusFilter}
        labelFilter={labelFilter}
        availableLabels={availableLabels}
        onStatusFilterChange={setStatusFilter}
        onLabelFilterChange={setLabelFilter}
        onClearFilters={() => {
          setStatusFilter([])
          setLabelFilter([])
        }}
      />

      {isLoading ? (
        <>
          {/* Desktop Table Skeleton */}
          <div className="hidden lg:block mt-6">
            <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 bg-accent/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[320px]">
                      Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6].map(i => <OrderTableRowSkeleton key={i} />)}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card Skeleton */}
          <div className="lg:hidden mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <OrderSkeleton key={i} />)}
          </div>
        </>
      ) : (
        <>
          {/* Active Orders Section */}
          {activeItems.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Active Orders ({activeItems.length} item{activeItems.length !== 1 ? 's' : ''})
              </h2>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/60 bg-accent/30">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[320px]">
                          Item
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeItems.map(({ order, item, isFirstItemInOrder }) => (
                        <OrderItemTableRow
                          key={`${order.id}-${item.id}`}
                          order={order}
                          item={item}
                          isFirstItemInOrder={isFirstItemInOrder}
                          onStatusChange={handleStatusUpdate}
                          onRefund={handleRefund}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {activeItems.map(({ order, item, isFirstItemInOrder }, index) => (
                    <motion.div
                      key={`${order.id}-${item.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <OrderItemCard
                        order={order}
                        item={item}
                        isFirstItemInOrder={isFirstItemInOrder}
                        onStatusChange={handleStatusUpdate}
                        onRefund={handleRefund}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Ready for Pickup Section */}
          {readyItems.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Ready for Pickup ({readyItems.length} item{readyItems.length !== 1 ? 's' : ''})
              </h2>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/60 bg-accent/30">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[320px]">
                          Item
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {readyItems.map(({ order, item, isFirstItemInOrder }) => (
                        <OrderItemTableRow
                          key={`${order.id}-${item.id}`}
                          order={order}
                          item={item}
                          isFirstItemInOrder={isFirstItemInOrder}
                          onStatusChange={handleStatusUpdate}
                          onRefund={handleRefund}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {readyItems.map(({ order, item, isFirstItemInOrder }, index) => (
                    <motion.div
                      key={`${order.id}-${item.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <OrderItemCard
                        order={order}
                        item={item}
                        isFirstItemInOrder={isFirstItemInOrder}
                        onStatusChange={handleStatusUpdate}
                        onRefund={handleRefund}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}

// Header component
interface HeaderProps {
  itemCount: number
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  onRefresh: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isLoading?: boolean
  statusFilter: ('received' | 'ready' | 'cancelled')[]
  labelFilter: string[]
  availableLabels: Array<{ name: string; color: string }>
  onStatusFilterChange: (statuses: ('received' | 'ready' | 'cancelled')[]) => void
  onLabelFilterChange: (labels: string[]) => void
  onClearFilters: () => void
}

function Header({
  itemCount,
  dateRange,
  onDateRangeChange,
  onRefresh,
  searchQuery,
  onSearchChange,
  isLoading,
  statusFilter,
  labelFilter,
  availableLabels,
  onStatusFilterChange,
  onLabelFilterChange,
  onClearFilters
}: HeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Title Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Order List</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search order # or customer"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 border-border/60"
          />
        </div>
        <div className="flex items-center gap-3">
          <OrderFilterPopover
            statusFilter={statusFilter}
            labelFilter={labelFilter}
            availableLabels={availableLabels}
            onStatusFilterChange={onStatusFilterChange}
            onLabelFilterChange={onLabelFilterChange}
            onClearFilters={onClearFilters}
          />
          <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="h-10 w-10 border-border/60 hover:bg-accent/50 shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
