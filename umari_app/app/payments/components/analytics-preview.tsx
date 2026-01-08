"use client"

import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { StripeAccount } from '@/lib/types'

interface AnalyticsPreviewProps {
  stripeAccount: StripeAccount
}

export function AnalyticsPreview({ stripeAccount }: AnalyticsPreviewProps) {
  const openStripeDashboard = () => {
    window.open('https://dashboard.stripe.com', '_blank')
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Payment Analytics</h2>
      <p className="text-sm text-muted-foreground mb-4">
        View detailed payment analytics, reports, and insights in your Stripe Dashboard.
      </p>

      <div className="flex justify-center">
        <Button onClick={openStripeDashboard} variant="outline" className="w-auto">
          Open Stripe Dashboard
          <ExternalLink className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
