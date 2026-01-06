import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PaymentsContent } from "./payments-content"
import { Navbar } from "@/components/navbar"

export default async function PaymentsPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch Stripe account data
  const { data: stripeAccount } = await supabase
    .from('stripe_accounts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch payment settings
  const { data: paymentSettings } = await supabase
    .from('payment_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />
      <PaymentsContent
        user={user}
        stripeAccount={stripeAccount}
        paymentSettings={paymentSettings}
      />
    </div>
  )
}
