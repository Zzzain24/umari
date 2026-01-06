import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { menuId, cart, customerName, customerEmail, customerPhone } = body

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

    const supabase = await createClient()

    // Get menu to find business owner
    const { data: menu, error: menuError } = await supabase
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

    // Check if business has connected Stripe account
    const { data: stripeAccount, error: stripeError } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id, charges_enabled')
      .eq('user_id', menu.user_id)
      .single()

    if (stripeError || !stripeAccount) {
      return NextResponse.json(
        { error: 'Business has not connected Stripe account' },
        { status: 400 }
      )
    }

    if (!stripeAccount.charges_enabled) {
      return NextResponse.json(
        { error: 'Business Stripe account is not ready to accept payments' },
        { status: 400 }
      )
    }

    // Get payment settings for platform fee
    const { data: paymentSettings, error: settingsError } = await supabase
      .from('payment_settings')
      .select('application_fee_percentage, default_currency')
      .eq('user_id', menu.user_id)
      .single()

    if (settingsError || !paymentSettings) {
      return NextResponse.json(
        { error: 'Payment settings not found' },
        { status: 500 }
      )
    }

    // Calculate totals
    const subtotal = cart.reduce((sum: number, item: any) => sum + item.totalPrice, 0)
    const platformFeePercentage = parseFloat(paymentSettings.application_fee_percentage.toString())
    const platformFee = (subtotal * platformFeePercentage) / 100
    const total = subtotal + platformFee

    // Convert to cents for Stripe
    const amountInCents = Math.round(total * 100)
    const applicationFeeInCents = Math.round(platformFee * 100)

    // Create Payment Intent with Stripe Connect
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: paymentSettings.default_currency || 'usd',
      application_fee_amount: applicationFeeInCents,
      on_behalf_of: stripeAccount.stripe_account_id,
      transfer_data: {
        destination: stripeAccount.stripe_account_id,
      },
      metadata: {
        menu_id: menuId,
        business_user_id: menu.user_id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || '',
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      subtotal,
      platformFee,
      total,
    })
  } catch (error: any) {
    console.error('Payment Intent creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

