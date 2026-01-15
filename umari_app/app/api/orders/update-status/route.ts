import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendOrderStatusUpdateEmail } from '@/lib/email'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // Verify the order belongs to the business owner and fetch full order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, menu_id, business_name')
      .eq('id', orderId)
      .eq('business_user_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found or you don't have permission to update it" },
        { status: 404 }
      )
    }

    // Update the order status
    const updateData: { order_status: string } = {
      order_status: newStatus
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (updateError) {
      throw updateError
    }

    // Send status update email if status changed to "ready" (not "cancelled" - that's handled by refund endpoints)
    if (newStatus === 'ready' && order.customer_email && order.customer_name) {
      // Fetch menu name for email context
      const { data: menuData } = await supabaseAdmin
        .from('menus')
        .select('name')
        .eq('id', order.menu_id)
        .single()

      const menuName = menuData?.name || order.business_name || 'Your Business'

      // Send email asynchronously (wrap in Promise.resolve to ensure tracking in serverless)
      Promise.resolve().then(async () => {
        try {
          const result = await sendOrderStatusUpdateEmail({
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            businessName: order.business_name || menuName,
            items: order.items as any[],
            subtotal: order.subtotal,
            total: order.total,
            orderDate: order.created_at,
            orderStatus: 'ready',
          })
          if (!result.success) {
            console.error('Failed to send order status update email:', result.error)
          }
        } catch (error) {
          // Log email errors but don't fail the status update
          console.error('Failed to send order status update email:', error)
        }
      }).catch((error) => {
        console.error('Unexpected error in email promise chain:', error)
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order status" },
      { status: 500 }
    )
  }
}
