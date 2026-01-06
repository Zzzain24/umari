"use client"

import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { StripeAccount } from '@/lib/types'

interface ConnectionStatusProps {
  stripeAccount: StripeAccount | null
}

export function ConnectionStatus({ stripeAccount }: ConnectionStatusProps) {
  if (!stripeAccount) {
    return (
      <div className="bg-muted border-l-4 border-l-muted-foreground p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Not Connected</p>
            <p className="text-sm text-muted-foreground">Connect your Stripe account to start accepting payments</p>
          </div>
        </div>
      </div>
    )
  }

  const { charges_enabled, payouts_enabled, details_submitted } = stripeAccount

  if (charges_enabled && payouts_enabled && details_submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-950 border-l-4 border-l-green-500 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">Connected & Active</p>
            <p className="text-sm text-green-700 dark:text-green-300">
              {stripeAccount.business_name || stripeAccount.email} • {stripeAccount.country?.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-l-yellow-500 p-4 rounded-lg">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        <div>
          <p className="font-medium text-yellow-900 dark:text-yellow-100">Action Required</p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Complete your Stripe account setup to accept payments
          </p>
        </div>
      </div>
    </div>
  )
}
