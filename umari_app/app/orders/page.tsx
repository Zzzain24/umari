import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { OrdersList } from "./orders-list"

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

  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />
      <OrdersList initialOrders={orders} userId={user.id} />
    </div>
  )
}
