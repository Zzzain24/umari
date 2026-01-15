import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendOrderRefundEmail } from '@/lib/email'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
})

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing orderId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify the order belongs to the business owner
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, business_user_id, payment_status, order_status, stripe_payment_intent_id, stripe_account_id')
      .eq('id', orderId)
      .eq('business_user_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found or you don't have permission to refund it" },
        { status: 404 }
      )
    }

    // Validate order can be refunded
    if (order.payment_status !== 'succeeded') {
      return NextResponse.json(
        { success: false, error: 'Only succeeded payments can be refunded' },
        { status: 400 }
      )
    }

    if (order.payment_status === 'refunded') {
      return NextResponse.json(
        { success: false, error: 'This order has already been refunded' },
        { status: 400 }
      )
    }

    if (!order.stripe_payment_intent_id) {
      return NextResponse.json(
        { success: false, error: 'Payment intent ID not found for this order' },
        { status: 400 }
      )
    }

    // Create refund via Stripe with application fee refund
    // For Direct Charges, refund must be made on the connected account
    try {
      const refund = await stripe.refunds.create(
        {
          payment_intent: order.stripe_payment_intent_id,
          refund_application_fee: true,
        },
        {
          stripeAccount: order.stripe_account_id,
        }
      )

      // Update order in database (both payment_status to 'refunded' AND order_status to 'cancelled')
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'refunded',
          order_status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (updateError) {
        throw updateError
      }

      // Fetch full order details for email (including customer info)
      const { data: fullOrder } = await supabaseAdmin
        .from('orders')
        .select('*, menu_id, business_name')
        .eq('id', orderId)
        .single()

      // Send refund email asynchronously if customer email exists
      if (fullOrder && fullOrder.customer_email && fullOrder.customer_name) {
        // Fetch menu name for email context
        const { data: menuData } = await supabaseAdmin
          .from('menus')
          .select('name')
          .eq('id', fullOrder.menu_id)
          .single()

        const menuName = menuData?.name || fullOrder.business_name || 'Your Business'

        // Send email asynchronously (don't block response)
        sendOrderRefundEmail({
          orderNumber: fullOrder.order_number,
          customerName: fullOrder.customer_name,
          customerEmail: fullOrder.customer_email,
          businessName: fullOrder.business_name || menuName,
          items: fullOrder.items as any[],
          subtotal: fullOrder.subtotal,
          total: fullOrder.total,
          orderDate: fullOrder.created_at,
          orderStatus: 'cancelled',
        }).catch((error) => {
          // Log email errors but don't fail the refund
          console.error('Failed to send order refund email:', error)
        })
      }

      return NextResponse.json({ 
        success: true,
        refundId: refund.id 
      })
    } catch (stripeError: any) {
      // Handle Stripe-specific errors
      if (stripeError.code === 'charge_already_refunded') {
        return NextResponse.json(
          { success: false, error: 'This payment has already been refunded in Stripe' },
          { status: 400 }
        )
      }
      
      if (stripeError.type === 'StripeCardError') {
        return NextResponse.json(
          { success: false, error: stripeError.message || 'Stripe error occurred' },
          { status: 400 }
        )
      }

      throw stripeError
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to process refund' },
      { status: 500 }
    )
  }
}
