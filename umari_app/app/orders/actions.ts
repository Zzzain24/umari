"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Order } from "@/lib/types"

interface UpdateStatusResult {
  success: boolean
  error?: string
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: Order['order_status']
): Promise<UpdateStatusResult> {
  const supabase = await createClient()

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
    // Verify the order belongs to the business owner
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, business_user_id, order_status')
      .eq('id', orderId)
      .eq('business_user_id', user.id)
      .single()

    if (orderError || !order) {
      return {
        success: false,
        error: "Order not found or you don't have permission to update it",
      }
    }

    // Update the order status
    const updateData: { order_status: Order['order_status'] } = {
      order_status: newStatus
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (updateError) {
      throw updateError
    }

    // Revalidate the orders and home pages
    revalidatePath('/orders')
    revalidatePath('/home')

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update order status",
    }
  }
}
