import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

// Generate Stripe Account Link for onboarding
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
        { error: 'No Stripe account found. Please connect to Stripe first.' },
        { status: 404 }
      )
    }

    // Create an Account Link for the user to complete onboarding
    // This redirects them to Stripe's hosted onboarding flow
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.stripe_account_id,
      refresh_url: `${request.nextUrl.origin}/payments?error=onboarding_refresh`,
      return_url: `${request.nextUrl.origin}/payments?success=onboarding_complete`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      success: true,
      url: accountLink.url,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'Failed to create account link',
        type: err.type || 'unknown',
      },
      { status: 500 }
    )
  }
}
