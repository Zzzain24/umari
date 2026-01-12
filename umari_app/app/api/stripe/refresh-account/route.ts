import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's Stripe account
    const { data: stripeAccount } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single()

    if (!stripeAccount) {
      return NextResponse.json(
        { error: 'No Stripe account found' },
        { status: 404 }
      )
    }

    // Fetch latest account details from Stripe
    const account = await stripe.accounts.retrieve(stripeAccount.stripe_account_id)

    // Update database with current account status
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
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update account status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        business_name: account.business_profile?.name,
      },
    })
  } catch (err: any) {
    // Log error type only, not sensitive details
    return NextResponse.json(
      {
        error: 'Failed to refresh account status',
        type: err.type || 'unknown',
      },
      { status: 500 }
    )
  }
}
