import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Stripe account
    const { data: stripeAccount, error: fetchError } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single()

    if (fetchError || !stripeAccount) {
      return NextResponse.json({ error: 'No Stripe account found' }, { status: 404 })
    }

    // Deauthorize on Stripe
    await stripe.oauth.deauthorize({
      client_id: process.env.STRIPE_CLIENT_ID!,
      stripe_user_id: stripeAccount.stripe_account_id,
    })

    // Delete from database
    const { error: deleteError } = await supabase
      .from('stripe_accounts')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Deauthorize error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
