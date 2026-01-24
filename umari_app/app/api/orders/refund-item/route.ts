import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendOrderRefundEmail, sendItemRefundEmail } from '@/lib/email'
import { deriveOrderStatus } from '@/lib/order-utils'
import { CartItem } from '@/lib/types'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
})

export async function POST(request: NextRequest) {
  try {
    const { orderId, itemId } = await request.json()

    if (!orderId || !itemId) {
      return NextResponse.json(
        { success: false, error: 'Missing orderId or itemId' },
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

    // Verify the order belongs to the business owner and fetch full order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
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

    // Find the specific item to refund
    const items = order.items as CartItem[]
    const itemIndex = items.findIndex(item => item.id === itemId)

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Item not found in order' },
        { status: 404 }
      )
    }

    const itemToRefund = items[itemIndex]

    // Check if item is already refunded
    if (itemToRefund.item_status === 'cancelled' && itemToRefund.refunded_amount) {
      return NextResponse.json(
        { success: false, error: 'This item has already been refunded' },
        { status: 400 }
      )
    }

    if (!order.stripe_payment_intent_id) {
      return NextResponse.json(
        { success: false, error: 'Payment intent ID not found for this order' },
        { status: 400 }
      )
    }

    // Get test_mode flag from stripe_accounts to determine charge type
    const { data: stripeAccount, error: stripeAccountError } = await supabaseAdmin
      .from('stripe_accounts')
      .select('test_mode')
      .eq('user_id', order.business_user_id)
      .single()

    if (stripeAccountError || !stripeAccount) {
      return NextResponse.json(
        { success: false, error: 'Stripe account not found for this order' },
        { status: 500 }
      )
    }

    const refundTimestamp = new Date().toISOString()

    // Create partial refund via Stripe for just this item
    try {
      let refund: Stripe.Refund

      // Calculate refund amount (item price in cents)
      const refundAmount = Math.round(itemToRefund.totalPrice * 100)

      if (stripeAccount.test_mode) {
        // Destination Charges: refund on platform account
        refund = await stripe.refunds.create({
          payment_intent: order.stripe_payment_intent_id,
          amount: refundAmount,
        })
      } else {
        // Direct Charges: refund on connected account with application fee refund
        // For partial refunds, we need to calculate the application fee portion
        const platformFeePercentage = parseFloat(process.env.STRIPE_PLATFORM_FEE_PERCENTAGE || '2.0')
        const applicationFeeAmount = Math.round(refundAmount * (platformFeePercentage / 100))
        
        refund = await stripe.refunds.create(
          {
            payment_intent: order.stripe_payment_intent_id,
            amount: refundAmount,
            refund_application_fee: true,
          },
          {
            stripeAccount: order.stripe_account_id,
          }
        )
      }

      // Update only the specific item as cancelled with refund tracking
      const updatedItems = [...items]
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        item_status: 'cancelled' as const,
        refunded_amount: itemToRefund.totalPrice,
        refunded_at: refundTimestamp,
      }

      // Derive new order status from all item statuses
      const newOrderStatus = deriveOrderStatus(updatedItems)

      // Check if all items are refunded - if so, mark payment_status as refunded
      const allItemsRefunded = updatedItems.every(item => 
        item.item_status === 'cancelled' && item.refunded_amount
      )

      // Update the order with updated items and derived order status
      const updateData: any = {
        items: updatedItems,
        order_status: newOrderStatus,
        updated_at: refundTimestamp,
      }

      // If all items are refunded, mark payment_status as refunded
      if (allItemsRefunded) {
        updateData.payment_status = 'refunded'
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (updateError) {
        throw updateError
      }

      // Fetch updated order for response
      const { data: updatedOrder } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      // Send refund email whenever an individual item is refunded
      if (order.customer_email && order.customer_name) {
        // Fetch menu name for email context (only if menu_id exists)
        let menuName = null
        if (order.menu_id) {
          const { data: menuData } = await supabaseAdmin
            .from('menus')
            .select('name')
            .eq('id', order.menu_id)
            .single()
          menuName = menuData?.name || null
        }

        const businessName = menuName || order.business_name || 'Your Business'

        // Check if all items are refunded - if so, send full order refund email
        // Otherwise, send individual item refund email
        if (allItemsRefunded) {
          // Send full order refund email when all items are refunded
          await sendOrderRefundEmail({
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            businessName,
            items: updatedItems as any[],
            subtotal: order.subtotal,
            total: order.total,
            orderDate: order.created_at,
            orderStatus: 'cancelled',
          }).catch(() => {})
        } else {
          // Send individual item refund email
          const refundedItem = updatedItems[itemIndex]
          const refundedItemName = `${refundedItem.quantity}x ${refundedItem.itemName}`
          
          await sendItemRefundEmail({
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            businessName,
            items: updatedItems as any[],
            subtotal: order.subtotal,
            total: order.total,
            orderDate: order.created_at,
            orderStatus: 'cancelled',
            refundedItemName,
            refundAmount: refundedItem.refunded_amount || refundedItem.totalPrice,
          }).catch(() => {})
        }
      }

      return NextResponse.json({
        success: true,
        refundId: refund.id,
        order: updatedOrder
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
      { success: false, error: 'Failed to process item refund' },
      { status: 500 }
    )
  }
}
