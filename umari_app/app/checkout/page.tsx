import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckoutForm } from './checkout-form'

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

  if (stripeError || !stripeAccount || !stripeAccount.charges_enabled) {
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
  const { data: paymentSettings } = await supabase
    .from('payment_settings')
    .select('application_fee_percentage, default_currency')
    .eq('user_id', menu.user_id)
    .single()

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

