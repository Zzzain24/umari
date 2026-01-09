import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { orderId, newStatus } = await request.json()

    if (!orderId || !newStatus) {
      return NextResponse.json(
        { success: false, error: "Missing orderId or newStatus" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Verify the order belongs to the business owner
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, business_user_id, order_status')
      .eq('id', orderId)
      .eq('business_user_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found or you don't have permission to update it" },
        { status: 404 }
      )
    }

    // Prevent updating completed/cancelled orders
    if (order.order_status === 'completed' || order.order_status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: "Cannot update a completed or cancelled order" },
        { status: 400 }
      )
    }

    // Update the order status
    const updateData: { order_status: string; completed_at?: string } = {
      order_status: newStatus
    }

    // Set completed_at timestamp if marking as completed
    if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order status" },
      { status: 500 }
    )
  }
}
