import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
})

// Use service role client for guest checkout (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // Validate phone number format (10-15 digits)
    if (customerPhone) {
      const digitsOnly = customerPhone.replace(/\D/g, '')
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        return NextResponse.json(
          { error: 'Please enter a valid phone number (10-15 digits)' },
          { status: 400 }
        )
      }
    }

    // Get menu to find business owner (use admin client for guest checkout)
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

    // Check if business has connected Stripe account (use admin client to bypass RLS)
    const { data: stripeAccount, error: stripeError } = await supabaseAdmin
      .from('stripe_accounts')
      .select('stripe_account_id, charges_enabled')
      .eq('user_id', menu.user_id)
      .single()

    if (stripeError || !stripeAccount) {
      console.error('Stripe account query error:', stripeError)
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

    // Get payment settings for platform fee (use admin client to bypass RLS)
    const { data: paymentSettings, error: settingsError } = await supabaseAdmin
      .from('payment_settings')
      .select('application_fee_percentage, default_currency')
      .eq('user_id', menu.user_id)
      .single()

    if (settingsError || !paymentSettings) {
      console.error('Payment settings error:', settingsError)
      console.error('User ID:', menu.user_id)
      return NextResponse.json(
        { error: 'Payment settings not found. Please configure payment settings in your account.' },
        { status: 500 }
      )
    }

    // Calculate totals
    // Customer pays only the subtotal - platform fee is deducted from business share
    const subtotal = cart.reduce((sum: number, item: any) => sum + item.totalPrice, 0)
    const platformFeePercentage = parseFloat(paymentSettings.application_fee_percentage.toString())
    const platformFee = (subtotal * platformFeePercentage) / 100
    const total = subtotal // Customer pays subtotal only, platform fee comes from business share

    // Convert to cents for Stripe
    const amountInCents = Math.round(total * 100)
    const applicationFeeInCents = Math.round(platformFee * 100)

    // Create Payment Intent with Stripe Connect
    // Include 'card' payment method type to enable Apple Pay and Google Pay
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: paymentSettings.default_currency || 'usd',
      payment_method_types: ['card'], // Enables card payments and wallet payments (Apple Pay, Google Pay)
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

