"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface DeleteMenuResult {
  success: boolean
  error?: string
}

export async function deleteMenu(menuId: string): Promise<DeleteMenuResult> {
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

  try {
    // Verify the menu belongs to the user (RLS should handle this, but double-check)
    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .select('id, user_id')
      .eq('id', menuId)
      .eq('user_id', user.id)
      .single()

    if (menuError || !menu) {
      return {
        success: false,
        error: "Menu not found or you don't have permission to delete it",
      }
    }

    // Delete the menu (cascade will handle menu_items and menu_item_options)
    const { error: deleteError } = await supabase
      .from('menus')
      .delete()
      .eq('id', menuId)

    if (deleteError) {
      throw deleteError
    }

    // Revalidate the menus and home pages
    revalidatePath('/menus')
    revalidatePath('/home')

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to delete menu",
    }
  }
}

