import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendOrderConfirmationEmail } from '@/lib/email'

// Use service role to bypass RLS for order creation
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      menuId,
      cart,
      customerName,
      customerEmail,
      stripePaymentIntentId,
      paymentStatus,
    } = body

    // Validate required fields
    if (!menuId || !cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: 'Menu ID and cart items are required' },
        { status: 400 }
      )
    }

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Customer name and email are required' },
        { status: 400 }
      )
    }

    // Validate name format (at least 2 characters, letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s'-]{2,}$/
    if (!nameRegex.test(customerName.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid name (at least 2 characters)' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    if (!stripePaymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }

    // Map Stripe PaymentIntent status to our database payment_status
    // Stripe statuses: succeeded, processing, requires_payment_method, requires_confirmation,
    //                  requires_action, requires_capture, canceled
    // Our DB statuses: pending, succeeded, failed, refunded
    const mapStripeStatusToDbStatus = (stripeStatus: string): string => {
      switch (stripeStatus) {
        case 'succeeded':
          return 'succeeded'
        case 'canceled':
          return 'failed'
        case 'processing':
        case 'requires_payment_method':
        case 'requires_confirmation':
        case 'requires_action':
        case 'requires_capture':
        default:
          return 'pending'
      }
    }

    const finalPaymentStatus = paymentStatus
      ? mapStripeStatusToDbStatus(paymentStatus)
      : 'pending'

    // Get menu to find business owner (including name to avoid second fetch later)
    const { data: menu, error: menuError } = await supabaseAdmin
      .from('menus')
      .select('id, user_id, name')
      .eq('id', menuId)
      .single()

    if (menuError || !menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    // Payment settings not needed for order creation - fee percentage comes from env

    // Get Stripe account ID and test_mode flag
    const { data: stripeAccount, error: stripeError } = await supabaseAdmin
      .from('stripe_accounts')
      .select('stripe_account_id, test_mode')
      .eq('user_id', menu.user_id)
      .single()

    if (stripeError || !stripeAccount) {
      return NextResponse.json(
        { error: 'Stripe account not found' },
        { status: 500 }
      )
    }

    // Calculate totals
    // Customer pays only subtotal - platform fee is deducted from business share
    const subtotal = cart.reduce((sum: number, item: any) => sum + item.totalPrice, 0)
    const platformFeePercentage = stripeAccount.test_mode
      ? 0
      : parseFloat(process.env.STRIPE_PLATFORM_FEE_PERCENTAGE || '2.0')
    const platformFee = (subtotal * platformFeePercentage) / 100
    const total = subtotal // Customer pays subtotal only, platform fee comes from business share

    // Create order (order_number and business_name/business_email auto-populated by triggers)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        menu_id: menuId,
        business_user_id: menu.user_id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: null,
        items: cart,
        subtotal,
        platform_fee: platformFee,
        total,
        stripe_payment_intent_id: stripePaymentIntentId,
        stripe_account_id: stripeAccount.stripe_account_id,
        payment_status: finalPaymentStatus, // Provided by checkout flow or webhook
        order_status: 'received',
      })
      .select('id, order_number, business_name, business_email, menu_id, created_at, items, subtotal, total, customer_name, customer_email')
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Use menu name from earlier fetch (no need for redundant database query)
    const menuName = menu.name || order.business_name || 'Your Business'

    // Send confirmation email asynchronously using after() to avoid blocking the response
    // This ensures the email is sent without adding latency to the customer's checkout experience
    if (customerEmail && (finalPaymentStatus === 'succeeded' || finalPaymentStatus === 'pending')) {
      after(() => {
        sendOrderConfirmationEmail({
          orderNumber: order.order_number,
          customerName,
          customerEmail,
          businessName: order.business_name || menuName,
          items: cart,
          subtotal,
          total,
          orderDate: order.created_at,
          orderStatus: 'received',
        }).catch((error) => {
          console.error('Failed to send order confirmation email:', error)
        })
      })
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.order_number,
      orderId: order.id,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

