import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { CheckoutForm } from './checkout-form'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
})

// Use service role client for guest checkout (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface PageProps {
  searchParams: Promise<{ menuId?: string }>
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams
  const menuId = params.menuId

  if (!menuId) {
    redirect('/')
  }

  // Fetch menu to get business info (public access)
  const { data: menu, error: menuError } = await supabaseAdmin
    .from('menus')
    .select('id, name, user_id')
    .eq('id', menuId)
    .single()

  if (menuError || !menu) {
    redirect('/')
  }

  // Check if business has connected Stripe account (use admin client to bypass RLS for guest checkout)
  const { data: stripeAccount, error: stripeError } = await supabaseAdmin
    .from('stripe_accounts')
    .select('stripe_account_id, charges_enabled')
    .eq('user_id', menu.user_id)
    .single()

  if (stripeError) {
    console.error('Stripe account query error:', stripeError)
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              Payment Not Available
            </h1>
            <p className="text-yellow-800 dark:text-yellow-200">
              This business has not set up payment processing yet. Please contact them directly to place an order.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!stripeAccount || !stripeAccount.stripe_account_id) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              Payment Not Available
            </h1>
            <p className="text-yellow-800 dark:text-yellow-200">
              This business has not set up payment processing yet. Please contact them directly to place an order.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Always verify with Stripe to get the most up-to-date status
  let chargesEnabled = false
  try {
    const account = await stripe.accounts.retrieve(stripeAccount.stripe_account_id)
    chargesEnabled = account.charges_enabled === true
    
    // Update database with current status if it differs
    if (account.charges_enabled !== stripeAccount.charges_enabled) {
      await supabaseAdmin
        .from('stripe_accounts')
        .update({
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', menu.user_id)
    }
  } catch (error) {
    console.error('Error fetching Stripe account status:', error)
    // Fall back to database value if Stripe API call fails
    chargesEnabled = stripeAccount.charges_enabled === true
  }

  if (!chargesEnabled) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              Payment Not Available
            </h1>
            <p className="text-yellow-800 dark:text-yellow-200">
              This business has not set up payment processing yet. Please contact them directly to place an order.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Get payment settings (use admin client to bypass RLS for guest checkout)
  const { data: paymentSettings, error: paymentSettingsError } = await supabaseAdmin
    .from('payment_settings')
    .select('application_fee_percentage, default_currency')
    .eq('user_id', menu.user_id)
    .single()

  if (paymentSettingsError || !paymentSettings) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              Payment Settings Not Found
            </h1>
            <p className="text-yellow-800 dark:text-yellow-200">
              Payment settings have not been configured for this business. Please contact the business owner.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <CheckoutForm
          menuId={menuId}
          menuName={menu.name}
          platformFeePercentage={paymentSettings?.application_fee_percentage || 2.0}
        />
      </div>
    </div>
  )
}

