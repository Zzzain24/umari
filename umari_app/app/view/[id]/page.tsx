import type React from "react"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MenuView } from "./menu-view"

interface PageProps {
  params: {
    id: string
  }
}

export default async function ViewMenuPage({ params }: PageProps) {
  const supabase = await createClient()

  // Fetch menu (public access - no user check needed)
  const { data: menu, error: menuError } = await supabase
    .from('menus')
    .select('id, name')
    .eq('id', params.id)
    .single()

  if (menuError || !menu) {
    notFound()
  }

  // Fetch menu items
  const { data: menuItems, error: itemsError } = await supabase
    .from('menu_items')
    .select('id, name, price')
    .eq('menu_id', params.id)
    .order('created_at', { ascending: true })

  if (itemsError || !menuItems) {
    notFound()
  }

  // Fetch menu item options
  let menuItemOptions = null
  
  if (menuItems.length > 0) {
    const { data: options, error: optionsError } = await supabase
      .from('menu_item_options')
      .select('id, menu_item_id, name, options, is_required')
      .in('menu_item_id', menuItems.map(item => item.id))
    
    if (!optionsError) {
      menuItemOptions = options
    }
  }

  // Transform data for display
  const itemsWithOptions = menuItems.map(item => {
    const itemOptions = (menuItemOptions || [])
      .filter(opt => opt.menu_item_id === item.id)
      .map(opt => ({
        id: opt.id,
        name: opt.name,
        options: opt.options as Array<{ value: string; price?: number }>,
        is_required: opt.is_required,
      }))

    return {
      id: item.id,
      name: item.name,
      price: item.price,
      options: itemOptions.length > 0 ? itemOptions : undefined,
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <MenuView menuName={menu.name} items={itemsWithOptions} />
    </div>
  )
}

