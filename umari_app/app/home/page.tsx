import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HomeContent } from "./home-content"
import { Navbar } from "@/components/navbar"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch menus with item count
  const { data: menusData } = await supabase
    .from('menus')
    .select(`
      id,
      name,
      created_at,
      updated_at,
      menu_items(count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Transform the data to include items_count
  const menus = (menusData || []).map(menu => ({
    ...menu,
    items_count: menu.menu_items?.[0]?.count || 0,
    menu_items: undefined // Remove the nested object
  }))

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <HomeContent menus={menus} />
    </div>
  )
}

