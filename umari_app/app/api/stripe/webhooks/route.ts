import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendOrderRefundEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Use service role for webhook operations (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        await supabaseAdmin
          .from('stripe_accounts')
          .update({
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
            email: account.email,
            business_name: account.business_profile?.name,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_account_id', account.id)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'succeeded',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        // Extract payment intent ID from charge (can be string or expanded object)
        const paymentIntentId = typeof charge.payment_intent === 'string' 
          ? charge.payment_intent 
          : charge.payment_intent?.id

        if (!paymentIntentId) {
          break
        }

        // Find order by payment intent ID and update both statuses
        const { data: order } = await supabaseAdmin
          .from('orders')
          .select('id, payment_status')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .single()

        if (order && order.payment_status === 'succeeded') {
          // Update both payment_status to 'refunded' AND order_status to 'cancelled'
          await supabaseAdmin
            .from('orders')
            .update({
              payment_status: 'refunded',
              order_status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_payment_intent_id', paymentIntentId)

          // Fetch full order details for email
          const { data: fullOrder } = await supabaseAdmin
            .from('orders')
            .select('*, menu_id, business_name')
            .eq('stripe_payment_intent_id', paymentIntentId)
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

            // Send email asynchronously (don't block webhook response)
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
              // Log email errors but don't fail the webhook
              console.error('Failed to send order refund email from webhook:', error)
            })
          }
        }
        break
      }

      default:
        // Unhandled event type - no action needed
        break
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
