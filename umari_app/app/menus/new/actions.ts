"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface CreateMenuData {
  name: string
  items: Array<{
    name: string
    price: number
    is_sold_out?: boolean
    allow_special_instructions?: boolean
    label_color?: string
    options?: Array<{
      name: string
      options: Array<{
        value: string
        price?: number
      }>
      is_required: boolean
    }>
  }>
}

export async function createMenu(data: CreateMenuData) {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Validate data
  if (!data.name || data.name.trim().length === 0) {
    throw new Error("Menu name is required")
  }

  if (!data.items || data.items.length === 0) {
    throw new Error("At least one menu item is required")
  }

  // Validate items
  const hexColorRegex = /^#[0-9A-F]{6}$/i
  for (const item of data.items) {
    if (!item.name || item.name.trim().length === 0) {
      throw new Error("All items must have a name")
    }
    if (typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) {
      throw new Error("All items must have a valid price greater than 0")
    }
    // Validate label_color if provided
    if (item.label_color && !hexColorRegex.test(item.label_color)) {
      throw new Error(`Invalid label color format for item "${item.name}". Must be a valid hex color (e.g., #9CA3AF)`)
    }
  }

  try {
    // Create menu
    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .insert({
        user_id: user.id,
        name: data.name.trim(),
      })
      .select()
      .single()

    if (menuError) throw menuError
    if (!menu) throw new Error("Failed to create menu")

    // Create menu items
    const menuItems = data.items.map(item => {
      // Validate and set label_color
      let labelColor = '#9CA3AF' // default
      if (item.label_color) {
        if (hexColorRegex.test(item.label_color)) {
          labelColor = item.label_color.toUpperCase()
        } else {
          // Invalid color, use default
          labelColor = '#9CA3AF'
        }
      }
      
      return {
        menu_id: menu.id,
        name: item.name.trim(),
        price: item.price,
        is_sold_out: item.is_sold_out || false,
        allow_special_instructions: item.allow_special_instructions ?? true,
        label_color: labelColor,
      }
    })

    const { data: insertedItems, error: itemsError } = await supabase
      .from('menu_items')
      .insert(menuItems)
      .select()

    if (itemsError) throw itemsError
    if (!insertedItems) throw new Error("Failed to create menu items")

    // Create menu item options if any
    const allOptions: Array<{
      menu_item_id: string
      name: string
      options: string[]
      is_required: boolean
    }> = []

    insertedItems.forEach((item, index) => {
      const originalItem = data.items[index]
      if (originalItem.options && originalItem.options.length > 0) {
        originalItem.options.forEach(option => {
          // Validate option
          if (!option.name || option.name.trim().length === 0) {
            return // Skip invalid options
          }
          if (!option.options || option.options.length === 0) {
            return // Skip options with no values
          }
          
          // Filter out empty values and format options
          const formattedOptions = option.options
            .filter(v => v.value && v.value.trim().length > 0)
            .map(v => ({
              value: v.value.trim(),
              price: v.price !== undefined && v.price > 0 ? v.price : undefined,
            }))
          
          if (formattedOptions.length === 0) {
            return // Skip if no valid values after filtering
          }
          
          allOptions.push({
            menu_item_id: item.id,
            name: option.name.trim(),
            options: formattedOptions,
            is_required: option.is_required || false,
          })
        })
      }
    })

    if (allOptions.length > 0) {
      const { error: optionsError } = await supabase
        .from('menu_item_options')
        .insert(allOptions)

      if (optionsError) throw optionsError
    }

    // Revalidate the home page to show the new menu
    revalidatePath('/home')
    revalidatePath('/menus')

    return { success: true, menuId: menu.id }
  } catch (error: any) {
    throw new Error(error.message || "Failed to create menu")
  }
}

