import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { OrdersList } from "./orders-list"
import type { Order, CartItem } from "@/lib/types"

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch orders for the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: ordersData } = await supabase
    .from('orders')
    .select('*')
    .eq('business_user_id', user.id)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  const orders = ordersData || []

  // Enrich orders with label_name from menu_items if missing
  // Collect menuItemIds that need label_name lookup
  const menuItemIdsToLookup = new Set<string>()
  const menuIdToMenuItemIds = new Map<string, Set<string>>()

  orders.forEach((order: Order) => {
    if (!order.menu_id) return
    
    if (!menuIdToMenuItemIds.has(order.menu_id)) {
      menuIdToMenuItemIds.set(order.menu_id, new Set())
    }
    
    order.items?.forEach((item: CartItem) => {
      if (!item.label_name && item.menuItemId) {
        menuItemIdsToLookup.add(item.menuItemId)
        menuIdToMenuItemIds.get(order.menu_id)!.add(item.menuItemId)
      }
    })
  })

  // Fetch menu items for missing label_names
  const labelNameMap = new Map<string, { label_name: string | null; label_color: string | null }>()
  
  if (menuItemIdsToLookup.size > 0) {
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, label_name, label_color')
      .in('id', Array.from(menuItemIdsToLookup))

    menuItems?.forEach(item => {
      labelNameMap.set(item.id, {
        label_name: item.label_name,
        label_color: item.label_color
      })
    })
  }

  // Enrich orders with label_name where missing
  const enrichedOrders = orders.map((order: Order) => {
    if (!order.items) return order

    const enrichedItems = order.items.map((item: CartItem) => {
      // If label_name is missing, try to get it from the lookup map
      if (!item.label_name && item.menuItemId) {
        const menuItemData = labelNameMap.get(item.menuItemId)
        if (menuItemData) {
          return {
            ...item,
            label_name: menuItemData.label_name || undefined,
            label_color: item.label_color || menuItemData.label_color || '#9CA3AF'
          }
        }
      }
      return item
    })

    return {
      ...order,
      items: enrichedItems
    }
  })

  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />
      <OrdersList initialOrders={enrichedOrders} userId={user.id} />
    </div>
  )
}
