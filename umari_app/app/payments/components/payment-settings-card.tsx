"use client"

import { CreditCard, Percent, Calculator } from 'lucide-react'

export function PaymentSettingsCard() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Payment Fees</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Simple, transparent pricing on every transaction
        </p>
      </div>

      <div className="space-y-3">
        {/* Umari Fee */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Percent className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Umari Platform Fee</p>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </div>
          </div>
          <span className="text-lg font-bold">2%</span>
        </div>

        {/* Stripe Fee */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Stripe Processing Fee</p>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </div>
          </div>
          <span className="text-lg font-bold">2.9% + $0.30</span>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calculator className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Total Fees</p>
              <p className="text-xs text-muted-foreground">Of transaction value</p>
            </div>
          </div>
          <span className="text-lg font-bold text-primary">~5%</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
        Stripe handles all payment processing and provides your payment dashboard.
        Fees are automatically deducted from each transaction.
      </p>
    </div>
  )
}
