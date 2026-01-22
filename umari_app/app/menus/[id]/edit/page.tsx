import type React from "react"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { MenuForm } from "../../new/menu-form"
import type { MenuItem, MenuItemOption } from "@/lib/types"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditMenuPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch menu with items and options
  const { data: menu, error: menuError } = await supabase
    .from('menus')
    .select('id, name, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (menuError || !menu) {
    redirect('/menus')
  }

  // Fetch menu items
  const { data: menuItems, error: itemsError } = await supabase
    .from('menu_items')
    .select('id, name, price, is_sold_out, allow_special_instructions, label_color')
    .eq('menu_id', id)
    .order('created_at', { ascending: true })

  if (itemsError) {
    redirect('/menus')
  }

  // Fetch menu item options
  let menuItemOptions = null
  let optionsError = null
  
  if (menuItems && menuItems.length > 0) {
    const result = await supabase
      .from('menu_item_options')
      .select('id, menu_item_id, name, options, is_required')
      .in('menu_item_id', menuItems.map(item => item.id))
    
    menuItemOptions = result.data
    optionsError = result.error
  }

  if (optionsError) {
    redirect('/menus')
  }

  // Transform data for the form
  const formItems: Array<MenuItem & { options?: MenuItemOption[] }> = (menuItems || []).map(item => {
    const itemOptions = (menuItemOptions || [])
      .filter(opt => opt.menu_item_id === item.id)
      .map(opt => ({
        id: opt.id,
        menu_item_id: opt.menu_item_id,
        name: opt.name,
        options: opt.options as MenuItemOption['options'],
        is_required: opt.is_required,
      }))

    return {
      id: item.id,
      name: item.name,
      price: item.price,
      is_sold_out: item.is_sold_out || false,
      allow_special_instructions: item.allow_special_instructions ?? true,
      label_color: item.label_color || '#9CA3AF',
      options: itemOptions.length > 0 ? itemOptions : undefined,
    }
  })

  return (
    <div className="min-h-screen bg-background pt-24">
      <Suspense fallback={<div>Loading...</div>}>
        <MenuForm
          menuId={id}
          initialMenuName={menu.name}
          initialItems={formItems}
        />
      </Suspense>
    </div>
  )
}

