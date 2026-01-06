import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { CheckoutForm } from './checkout-form'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

interface PageProps {
  searchParams: Promise<{ menuId?: string }>
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams
  const menuId = params.menuId

  if (!menuId) {
    redirect('/')
  }

  const supabase = await createClient()

  // Fetch menu to get business info
  const { data: menu, error: menuError } = await supabase
    .from('menus')
    .select('id, name, user_id')
    .eq('id', menuId)
    .single()

  if (menuError || !menu) {
    redirect('/')
  }

  // Check if business has connected Stripe account
  const { data: stripeAccount, error: stripeError } = await supabase
    .from('stripe_accounts')
    .select('stripe_account_id, charges_enabled')
    .eq('user_id', menu.user_id)
    .single()

  if (stripeError || !stripeAccount) {
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

  // If database says charges_enabled is false, verify directly with Stripe
  let chargesEnabled = stripeAccount.charges_enabled
  if (!chargesEnabled) {
    try {
      const account = await stripe.accounts.retrieve(stripeAccount.stripe_account_id)
      chargesEnabled = account.charges_enabled
      
      // Update database with current status
      if (account.charges_enabled !== stripeAccount.charges_enabled) {
        await supabase
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
      // If we can't verify, fall back to database value
    }
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

  // Get payment settings
  const { data: paymentSettings, error: paymentSettingsError } = await supabase
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

