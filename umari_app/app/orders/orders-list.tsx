"use client"

import type { Order } from "@/lib/types"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { OrderCard } from "./order-card"
import { OrderTableRow } from "./order-table-row"
import { OrdersEmpty } from "./orders-empty"
import { DateRangePicker } from "./date-range-picker"
import { OrderSkeleton } from "./order-skeleton"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { createClient } from "@/lib/supabase/client"

interface OrdersListProps {
  initialOrders: Order[]
  userId: string
}

export function OrdersList({ initialOrders, userId }: OrdersListProps) {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [isLoading, setIsLoading] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  })

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

  // Loading state
  if (isLoading) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header
          orderCount={0}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onRefresh={handleRefresh}
          isLoading={true}
        />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <OrderSkeleton key={i} />)}
        </div>
      </main>
    )
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header
          orderCount={0}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onRefresh={handleRefresh}
        />
        <div className="mt-8">
          <OrdersEmpty dateRange={dateRange} />
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Header
        orderCount={orders.length}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onRefresh={handleRefresh}
      />

      {/* Desktop Table View */}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Items
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderTableRow
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusUpdate}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <OrderCard
                order={order}
                onStatusChange={handleStatusUpdate}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </main>
  )
}

// Header component
interface HeaderProps {
  orderCount: number
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  onRefresh: () => void
  isLoading?: boolean
}

function Header({ orderCount, dateRange, onDateRangeChange, onRefresh, isLoading }: HeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Title Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Order List</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {orderCount} order{orderCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
  )
}
