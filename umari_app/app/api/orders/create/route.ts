import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
      customerPhone,
      stripePaymentIntentId,
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

    if (!stripePaymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }

    // Get menu to find business owner
    const { data: menu, error: menuError } = await supabaseAdmin
      .from('menus')
      .select('id, user_id')
      .eq('id', menuId)
      .single()

    if (menuError || !menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    // Get payment settings for platform fee calculation
    const { data: paymentSettings, error: settingsError } = await supabaseAdmin
      .from('payment_settings')
      .select('application_fee_percentage')
      .eq('user_id', menu.user_id)
      .single()

    if (settingsError || !paymentSettings) {
      return NextResponse.json(
        { error: 'Payment settings not found' },
        { status: 500 }
      )
    }

    // Get Stripe account ID
    const { data: stripeAccount, error: stripeError } = await supabaseAdmin
      .from('stripe_accounts')
      .select('stripe_account_id')
      .eq('user_id', menu.user_id)
      .single()

    if (stripeError || !stripeAccount) {
      return NextResponse.json(
        { error: 'Stripe account not found' },
        { status: 500 }
      )
    }

    // Calculate totals
    const subtotal = cart.reduce((sum: number, item: any) => sum + item.totalPrice, 0)
    const platformFeePercentage = parseFloat(paymentSettings.application_fee_percentage.toString())
    const platformFee = (subtotal * platformFeePercentage) / 100
    const total = subtotal + platformFee

    // Create order (order_number and business_name/business_email auto-populated by triggers)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        menu_id: menuId,
        business_user_id: menu.user_id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        items: cart,
        subtotal,
        platform_fee: platformFee,
        total,
        stripe_payment_intent_id: stripePaymentIntentId,
        stripe_account_id: stripeAccount.stripe_account_id,
        payment_status: 'pending', // Will be updated by webhook
        order_status: 'received',
      })
      .select('id, order_number')
      .single()

    if (orderError || !order) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.order_number,
      orderId: order.id,
    })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}

