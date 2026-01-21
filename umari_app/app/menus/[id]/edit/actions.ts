"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export interface UpdateMenuData {
  name: string
  items: Array<{
    id?: string
    name: string
    price: number
    is_sold_out?: boolean
    allow_special_instructions?: boolean
    options?: Array<{
      id?: string
      name: string
      options: Array<{
        value: string
        price?: number
      }>
      is_required: boolean
    }>
  }>
}

interface UpdateMenuResult {
  success: boolean
  error?: string
}

export async function updateMenu(
  menuId: string,
  data: UpdateMenuData
): Promise<UpdateMenuResult> {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "Not authenticated",
    }
  }

  // Validate data
  if (!data.name || data.name.trim().length === 0) {
    return {
      success: false,
      error: "Menu name is required",
    }
  }

  if (!data.items || data.items.length === 0) {
    return {
      success: false,
      error: "At least one menu item is required",
    }
  }

  // Validate items
  for (const item of data.items) {
    if (!item.name || item.name.trim().length === 0) {
      return {
        success: false,
        error: "All items must have a name",
      }
    }
    if (typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) {
      return {
        success: false,
        error: "All items must have a valid price greater than 0",
      }
    }
  }

  try {
    // Verify the menu belongs to the user
    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .select('id, user_id')
      .eq('id', menuId)
      .eq('user_id', user.id)
      .single()

    if (menuError || !menu) {
      return {
        success: false,
        error: "Menu not found or you don't have permission to edit it",
      }
    }

    // Update menu name
    const { error: updateMenuError } = await supabase
      .from('menus')
      .update({ name: data.name.trim() })
      .eq('id', menuId)

    if (updateMenuError) throw updateMenuError

    // Get existing menu items
    const { data: existingItems, error: itemsError } = await supabase
      .from('menu_items')
      .select('id')
      .eq('menu_id', menuId)

    if (itemsError) throw itemsError

    const existingItemIds = new Set(existingItems?.map(item => item.id) || [])
    const newItemIds = new Set(
      data.items
        .filter(item => item.id)
        .map(item => item.id!)
    )

    // Delete items that are no longer in the data
    const itemsToDelete = Array.from(existingItemIds).filter(
      id => !newItemIds.has(id)
    )

    if (itemsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('menu_items')
        .delete()
        .in('id', itemsToDelete)

      if (deleteError) throw deleteError
    }

    // Process each item
    for (const item of data.items) {
      if (item.id && existingItemIds.has(item.id)) {
        // Update existing item
        const { error: updateError } = await supabase
          .from('menu_items')
          .update({
            name: item.name.trim(),
            price: item.price,
            is_sold_out: item.is_sold_out || false,
            allow_special_instructions: item.allow_special_instructions ?? true,
          })
          .eq('id', item.id)

        if (updateError) throw updateError

        // Handle options for existing item
        if (item.options && item.options.length > 0) {
          // Get existing options
          const { data: existingOptions } = await supabase
            .from('menu_item_options')
            .select('id')
            .eq('menu_item_id', item.id)

          const existingOptionIds = new Set(
            existingOptions?.map(opt => opt.id) || []
          )
          const newOptionIds = new Set(
            item.options
              .filter(opt => opt.id)
              .map(opt => opt.id!)
          )

          // Delete removed options
          const optionsToDelete = Array.from(existingOptionIds).filter(
            id => !newOptionIds.has(id)
          )

          if (optionsToDelete.length > 0) {
            const { error: deleteOptError } = await supabase
              .from('menu_item_options')
              .delete()
              .in('id', optionsToDelete)

            if (deleteOptError) throw deleteOptError
          }

          // Update or insert options
          for (const option of item.options) {
            const formattedOptions = option.options
              .filter(v => v.value && v.value.trim().length > 0)
              .map(v => ({
                value: v.value.trim(),
                price: v.price !== undefined && v.price > 0 ? v.price : undefined,
              }))

            if (formattedOptions.length === 0) continue

            if (option.id && existingOptionIds.has(option.id)) {
              // Update existing option
              const { error: updateOptError } = await supabase
                .from('menu_item_options')
                .update({
                  name: option.name.trim(),
                  options: formattedOptions,
                  is_required: option.is_required || false,
                })
                .eq('id', option.id)

              if (updateOptError) throw updateOptError
            } else {
              // Insert new option
              const { error: insertOptError } = await supabase
                .from('menu_item_options')
                .insert({
                  menu_item_id: item.id,
                  name: option.name.trim(),
                  options: formattedOptions,
                  is_required: option.is_required || false,
                })

              if (insertOptError) throw insertOptError
            }
          }
        } else {
          // Delete all options if none provided
          const { error: deleteAllOptsError } = await supabase
            .from('menu_item_options')
            .delete()
            .eq('menu_item_id', item.id)

          if (deleteAllOptsError) throw deleteAllOptsError
        }
      } else {
        // Insert new item
        const { data: newItem, error: insertError } = await supabase
          .from('menu_items')
          .insert({
            menu_id: menuId,
            name: item.name.trim(),
            price: item.price,
            is_sold_out: item.is_sold_out || false,
            allow_special_instructions: item.allow_special_instructions ?? true,
          })
          .select()
          .single()

        if (insertError) throw insertError
        if (!newItem) throw new Error("Failed to create menu item")

        // Insert options for new item
        if (item.options && item.options.length > 0) {
          const formattedOptions = item.options
            .filter(opt => opt.name && opt.name.trim().length > 0)
            .filter(opt => opt.options && opt.options.length > 0)
            .map(opt => {
              const formatted = opt.options
                .filter(v => v.value && v.value.trim().length > 0)
                .map(v => ({
                  value: v.value.trim(),
                  price: v.price !== undefined && v.price > 0 ? v.price : undefined,
                }))

              if (formatted.length === 0) return null

              return {
                menu_item_id: newItem.id,
                name: opt.name.trim(),
                options: formatted,
                is_required: opt.is_required || false,
              }
            })
            .filter((opt): opt is NonNullable<typeof opt> => opt !== null)

          if (formattedOptions.length > 0) {
            const { error: insertOptsError } = await supabase
              .from('menu_item_options')
              .insert(formattedOptions)

            if (insertOptsError) throw insertOptsError
          }
        }
      }
    }

    // Revalidate paths
    revalidatePath('/menus')
    revalidatePath('/home')
    revalidatePath(`/menus/${menuId}/edit`)

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update menu",
    }
  }
}

