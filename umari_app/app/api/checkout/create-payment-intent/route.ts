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
      .select('stripe_account_id, charges_enabled, currency, test_mode')
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

    // Get payment settings for currency (use admin client to bypass RLS)
    let { data: paymentSettings, error: settingsError } = await supabaseAdmin
      .from('payment_settings')
      .select('default_currency')
      .eq('user_id', menu.user_id)
      .single()

    // If payment settings don't exist but Stripe is connected, create them
    if (settingsError || !paymentSettings) {
      const defaultCurrency = stripeAccount?.currency || 'usd'
      
      // Try to create payment settings
      const { data: newPaymentSettings, error: createError } = await supabaseAdmin
        .from('payment_settings')
        .upsert({
          user_id: menu.user_id,
          default_currency: defaultCurrency,
          accepts_cards: true,
          accepts_apple_pay: true,
          accepts_google_pay: true,
          auto_payout_enabled: true,
          supported_currencies: [defaultCurrency],
        })
        .select('default_currency')
        .single()

      if (createError || !newPaymentSettings) {
        return NextResponse.json(
          { error: 'Payment settings not found. Please configure payment settings in your account.' },
          { status: 500 }
        )
      }
      
      paymentSettings = newPaymentSettings
    }

    // Fetch menu items from database to verify prices server-side
    const { data: menuItems, error: menuItemsError } = await supabaseAdmin
      .from('menu_items')
      .select('id, price, name')
      .eq('menu_id', menuId)

    if (menuItemsError || !menuItems) {
      return NextResponse.json(
        { error: 'Failed to verify menu items' },
        { status: 500 }
      )
    }

    // Create a lookup map for menu item prices
    const menuItemPrices = new Map<string, number>()
    menuItems.forEach((item: { id: string; price: number }) => {
      menuItemPrices.set(item.id, item.price)
    })

    // Validate and recalculate cart totals server-side
    let serverCalculatedSubtotal = 0
    for (const cartItem of cart) {
      if (!cartItem.menuItemId || typeof cartItem.quantity !== 'number' || cartItem.quantity < 1) {
        return NextResponse.json(
          { error: 'Invalid cart item format' },
          { status: 400 }
        )
      }

      const serverPrice = menuItemPrices.get(cartItem.menuItemId)
      if (serverPrice === undefined) {
        return NextResponse.json(
          { error: `Menu item not found: ${cartItem.itemName || cartItem.menuItemId}` },
          { status: 400 }
        )
      }

      // Calculate item total (base price * quantity + options)
      let itemTotal = serverPrice * cartItem.quantity

      // Add option prices if present (options are trusted as they're calculated client-side
      // but the base price is verified server-side)
      if (cartItem.optionsPrice && typeof cartItem.optionsPrice === 'number') {
        itemTotal += cartItem.optionsPrice * cartItem.quantity
      }

      serverCalculatedSubtotal += itemTotal
    }

    // Round to 2 decimal places to avoid floating point issues
    serverCalculatedSubtotal = Math.round(serverCalculatedSubtotal * 100) / 100
    const clientSubtotal = Math.round(cart.reduce((sum: number, item: any) => sum + item.totalPrice, 0) * 100) / 100

    // Allow small tolerance for floating point differences (1 cent)
    if (Math.abs(serverCalculatedSubtotal - clientSubtotal) > 0.01) {
      return NextResponse.json(
        { error: 'Cart prices have changed. Please refresh and try again.' },
        { status: 400 }
      )
    }

    // Use server-calculated subtotal for payment
    const subtotal = serverCalculatedSubtotal
    const platformFeePercentage = stripeAccount.test_mode
      ? 0
      : parseFloat(process.env.STRIPE_PLATFORM_FEE_PERCENTAGE || '2.0')
    const platformFee = (subtotal * platformFeePercentage) / 100
    const total = subtotal // Customer pays subtotal only, platform fee comes from business share

    // Convert to cents for Stripe
    const amountInCents = Math.round(total * 100)
    const applicationFeeInCents = Math.round(platformFee * 100)

    // Create Payment Intent with Stripe Connect
    // When test_mode is TRUE: use Destination Charges (platform absorbs all fees)
    // When test_mode is FALSE: use Direct Charges (business pays Stripe fees, platform collects application fee)
    // Using automatic_payment_methods to enable Apple Pay, Google Pay, and other wallets
    let paymentIntent: Stripe.PaymentIntent

    if (stripeAccount.test_mode) {
      // Ensure Apple Pay domains are registered on platform account for Destination Charges
      // Apple Pay domains must be registered on the account where payment intents are created
      const appDomains = ['umari.app', 'www.umari.app']
      for (const domain of appDomains) {
        try {
          await stripe.applePayDomains.create({
            domain_name: domain,
          })
        } catch (domainError: any) {
          // Ignore if domain already registered or if there's an issue
          // This is safe to call on every payment intent - Stripe will handle duplicates
        }
      }

      // Destination Charges: charge on platform account, transfer full amount to connected account
      // Platform absorbs all Stripe fees (2.9% + $0.30)
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: paymentSettings.default_currency || 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        on_behalf_of: stripeAccount.stripe_account_id,
        transfer_data: {
          amount: amountInCents,
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
    } else {
      // Direct Charges: charge on connected account, business pays Stripe fees
      // The charge appears on the connected account's Stripe dashboard
      paymentIntent = await stripe.paymentIntents.create(
        {
          amount: amountInCents,
          currency: paymentSettings.default_currency || 'usd',
          automatic_payment_methods: {
            enabled: true,
          },
          application_fee_amount: applicationFeeInCents,
          metadata: {
            menu_id: menuId,
            business_user_id: menu.user_id,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone || '',
          },
        },
        {
          stripeAccount: stripeAccount.stripe_account_id,
        }
      )
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      stripeAccountId: stripeAccount.stripe_account_id,
      subtotal,
      platformFee,
      total,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

