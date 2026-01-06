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
      console.error('Database error:', dbError)
      return NextResponse.redirect(
        new URL('/payments?error=database_error', request.url)
      )
    }

    // Fetch account details from Stripe
    const account = await stripe.accounts.retrieve(response.stripe_user_id)

    // Update account status
    await supabase
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

    // Create default payment settings if not exists
    await supabase
      .from('payment_settings')
      .upsert({
        user_id: user.id,
        monetization_model: 'application_fee',
        application_fee_percentage: parseFloat(process.env.STRIPE_PLATFORM_FEE_PERCENTAGE || '2.0'),
        default_currency: account.default_currency || 'usd',
      })

    return NextResponse.redirect(
      new URL('/payments?success=true', request.url)
    )
  } catch (err: any) {
    console.error('Stripe OAuth error:', err)
    return NextResponse.redirect(
      new URL(`/payments?error=${encodeURIComponent(err.message)}`, request.url)
    )
  }
}
