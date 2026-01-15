import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
})

// Register Apple Pay domain on a connected account
// This enables Apple Pay for payments processed through that account
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get the user's connected Stripe account
    const { data: stripeAccount, error: accountError } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single()

    if (accountError || !stripeAccount) {
      return NextResponse.json(
        { success: false, error: 'No Stripe account connected' },
        { status: 400 }
      )
    }

    // Get the domain from the request or use default
    const body = await request.json().catch(() => ({}))
    const domain = body.domain || process.env.NEXT_PUBLIC_APP_DOMAIN || 'umari.app'

    // Register the domain for Apple Pay on the connected account
    const applePayDomain = await stripe.applePayDomains.create(
      { domain_name: domain },
      { stripeAccount: stripeAccount.stripe_account_id }
    )

    return NextResponse.json({
      success: true,
      domain: applePayDomain.domain_name,
      id: applePayDomain.id,
    })
  } catch (error: any) {
    // Handle case where domain is already registered
    if (error.code === 'resource_already_exists') {
      return NextResponse.json({
        success: true,
        message: 'Domain already registered',
      })
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register domain' },
      { status: 500 }
    )
  }
}

// List registered Apple Pay domains for the connected account
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get the user's connected Stripe account
    const { data: stripeAccount, error: accountError } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single()

    if (accountError || !stripeAccount) {
      return NextResponse.json(
        { success: false, error: 'No Stripe account connected' },
        { status: 400 }
      )
    }

    // List registered domains
    const domains = await stripe.applePayDomains.list(
      { limit: 100 },
      { stripeAccount: stripeAccount.stripe_account_id }
    )

    return NextResponse.json({
      success: true,
      domains: domains.data.map((d) => ({
        id: d.id,
        domain: d.domain_name,
        livemode: d.livemode,
      })),
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list domains' },
      { status: 500 }
    )
  }
}
