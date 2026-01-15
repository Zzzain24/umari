import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state') // User ID for verification
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/payments?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/payments?error=missing_parameters', request.url)
    )
  }

  try {
    const supabase = await createClient()

    // Verify authenticated user matches state
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.id !== state) {
      return NextResponse.redirect(
        new URL('/payments?error=unauthorized', request.url)
      )
    }

    // Exchange authorization code for access token
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    })

    // Save Stripe account to database
    const { error: dbError } = await supabase
      .from('stripe_accounts')
      .upsert({
        user_id: user.id,
        stripe_account_id: response.stripe_user_id,
        stripe_user_id: response.stripe_user_id,
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        scope: response.scope,
        account_type: 'standard',
        updated_at: new Date().toISOString(),
      })

    if (dbError) {
      return NextResponse.redirect(
        new URL('/payments?error=database_error', request.url)
      )
    }

    // Fetch account details from Stripe
    const account = await stripe.accounts.retrieve(response.stripe_user_id)

    // Update account status
    const { error: updateError } = await supabase
      .from('stripe_accounts')
      .update({
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        country: account.country,
        currency: account.default_currency,
        email: account.email,
        business_name: account.business_profile?.name,
      })
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.redirect(
        new URL('/payments?error=update_failed', request.url)
      )
    }

    // Create default payment settings if not exists
    const defaultCurrency = account.default_currency || 'usd'
    const { error: settingsError } = await supabase
      .from('payment_settings')
      .upsert({
        user_id: user.id,
        default_currency: defaultCurrency,
        accepts_cards: true,
        accepts_apple_pay: true,
        accepts_google_pay: true,
        auto_payout_enabled: true,
        supported_currencies: [defaultCurrency],
      })

    if (settingsError) {
      return NextResponse.redirect(
        new URL('/payments?error=settings_creation_failed', request.url)
      )
    }

    // Register Apple Pay domain on the connected account for wallet payments
    // This enables Apple Pay and Google Pay for Direct Charges
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'umari.app'
    try {
      await stripe.applePayDomains.create(
        { domain_name: appDomain },
        { stripeAccount: response.stripe_user_id }
      )
    } catch (domainError: any) {
      // Ignore if domain already registered or if there's an issue
      // Apple Pay will still work if the domain is registered on the platform
      console.error('Apple Pay domain registration:', domainError.message)
    }

    return NextResponse.redirect(
      new URL('/payments?success=true', request.url)
    )
  } catch (err: any) {
    return NextResponse.redirect(
      new URL('/payments?error=oauth_failed', request.url)
    )
  }
}
