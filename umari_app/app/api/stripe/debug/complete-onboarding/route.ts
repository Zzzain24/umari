import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Only allow in test mode for safety
export async function POST(request: NextRequest) {
  // Safety check - only in test mode
  if (!process.env.STRIPE_SECRET_KEY?.includes('test')) {
    return NextResponse.json(
      { error: 'This endpoint is only available in test mode' },
      { status: 403 }
    )
  }

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

    console.log('Completing onboarding for:', stripeAccount.stripe_account_id)

    // Update the account with test data to complete onboarding
    await stripe.accounts.update(stripeAccount.stripe_account_id, {
      business_type: 'individual',
      business_profile: {
        mcc: '5812', // Eating places and restaurants
        url: 'https://example.com',
      },
      individual: {
        first_name: 'Test',
        last_name: 'Account',
        dob: {
          day: 1,
          month: 1,
          year: 1990,
        },
        address: {
          line1: 'address_full_match', // Magic test value
          city: 'Schenectady',
          state: 'NY',
          postal_code: '12345',
          country: 'US',
        },
        ssn_last_4: '0000', // Test SSN
        email: user.email || 'test@example.com',
      },
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    })

    console.log('Account updated, adding bank account...')

    // Add external account (bank account for payouts)
    await stripe.accounts.createExternalAccount(
      stripeAccount.stripe_account_id,
      {
        external_account: {
          object: 'bank_account',
          country: 'US',
          currency: 'usd',
          routing_number: '110000000', // Test routing number
          account_number: '000123456789', // Test account number
        },
      }
    )

    console.log('Bank account added, fetching updated account...')

    // Fetch updated account to get current status
    const account = await stripe.accounts.retrieve(stripeAccount.stripe_account_id)

    console.log('Account status:', {
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    })

    // Update database with new account status
    await supabase
      .from('stripe_accounts')
      .update({
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      message: 'Test account onboarding completed successfully',
      account: {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        business_name: account.business_profile?.name,
      },
    })
  } catch (err: any) {
    console.error('Complete onboarding error:', err)
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
