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

      <Button onClick={openStripeDashboard} variant="outline" className="w-full">
        Open Stripe Dashboard
        <ExternalLink className="ml-2 w-4 h-4" />
      </Button>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold">--</p>
          <p className="text-xs text-muted-foreground">Total Sales</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">--</p>
          <p className="text-xs text-muted-foreground">Orders</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">--</p>
          <p className="text-xs text-muted-foreground">This Month</p>
        </div>
      </div>
      <p className="text-xs text-center text-muted-foreground mt-2">
        Live data available in Stripe Dashboard
      </p>
    </div>
  )
}
