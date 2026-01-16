"use client"

import { CreditCard, Percent, Calculator, Sparkles } from 'lucide-react'

interface PaymentSettingsCardProps {
  testMode?: boolean
}

export function PaymentSettingsCard({ testMode = false }: PaymentSettingsCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Payment Fees</h2>
          {testMode && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-full">
              <Sparkles className="w-3 h-3" />
              Early Adopter
            </span>
          )}
        </div>
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
          <span className="text-lg font-bold">{testMode ? '0%' : '2%'}</span>
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
          <span className="text-lg font-bold">{testMode ? '0%' : '2.9% + $0.30'}</span>
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
          <span className="text-lg font-bold text-primary">{testMode ? '0%' : '~5%'}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
        Stripe handles all payment processing and provides your payment dashboard.
        Fees are automatically deducted from each transaction.
      </p>
    </div>
  )
}
