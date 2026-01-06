import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
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

    console.log('Creating account link for:', stripeAccount.stripe_account_id)

    // Create an Account Link for the user to complete onboarding
    // This redirects them to Stripe's hosted onboarding flow
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.stripe_account_id,
      refresh_url: `${request.nextUrl.origin}/payments?error=onboarding_refresh`,
      return_url: `${request.nextUrl.origin}/payments?success=onboarding_complete`,
      type: 'account_onboarding',
    })

    console.log('Account link created:', accountLink.url)

    return NextResponse.json({
      success: true,
      url: accountLink.url,
    })
  } catch (err: any) {
    console.error('Account link creation error:', err)
    return NextResponse.json(
      {
        error: err.message,
        type: err.type,
        details: err.raw?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
