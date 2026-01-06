"use client"

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { ConnectionStatus } from './components/connection-status'
import { ConnectStripeButton } from './components/connect-stripe-button'
import { PaymentSettingsCard } from './components/payment-settings-card'
import { AnalyticsPreview } from './components/analytics-preview'
import { DisconnectButton } from './components/disconnect-button'
import { useToast } from '@/hooks/use-toast'
import type { StripeAccount, PaymentSettings } from '@/lib/types'

interface PaymentsContentProps {
  user: User
  stripeAccount: StripeAccount | null
  paymentSettings: PaymentSettings | null
}

export function PaymentsContent({
  user,
  stripeAccount: initialStripeAccount,
  paymentSettings: initialPaymentSettings
}: PaymentsContentProps) {
  const [stripeAccount, setStripeAccount] = useState(initialStripeAccount)
  const [paymentSettings, setPaymentSettings] = useState(initialPaymentSettings)
  const { toast } = useToast()

  // Check for OAuth callback success/error
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    const error = params.get('error')

    if (success === 'true') {
      toast({
        title: 'Connected!',
        description: 'Your Stripe account has been successfully connected.',
        duration: 5000,
      })
      // Refresh the page to load new account data
      window.location.replace('/payments')
    } else if (success === 'onboarding_complete') {
      toast({
        title: 'Onboarding Complete!',
        description: 'Your Stripe account is now ready to accept payments.',
        duration: 5000,
      })
      // Refresh the page to load updated account status
      window.location.replace('/payments')
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        'onboarding_refresh': 'Onboarding link expired. Please try again.',
      }

      toast({
        title: 'Connection Failed',
        description: errorMessages[error] || `Error: ${error}`,
        variant: 'destructive',
        duration: 5000,
      })
      // Clean URL
      window.history.replaceState({}, '', '/payments')
    }
  }, [toast])

  const isConnected = !!stripeAccount
  const isRestricted = isConnected && !stripeAccount?.charges_enabled
  const [isActivating, setIsActivating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleCompleteOnboarding = async () => {
    setIsActivating(true)
    try {
      const response = await fetch('/api/stripe/debug/complete-onboarding', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok && data.success && data.url) {
        // Redirect to Stripe's hosted onboarding flow
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to generate onboarding link')
      }
    } catch (error: any) {
      toast({
        title: 'Onboarding Failed',
        description: error.message,
        variant: 'destructive',
        duration: 5000,
      })
      setIsActivating(false)
    }
  }

  const handleRefreshStatus = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/stripe/refresh-account', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: 'Status Updated',
          description: 'Your account status has been refreshed from Stripe.',
          duration: 3000,
        })
        // Reload to show updated status
        window.location.reload()
      } else {
        throw new Error(data.error || 'Failed to refresh account status')
      }
    } catch (error: any) {
      toast({
        title: 'Refresh Failed',
        description: error.message,
        variant: 'destructive',
        duration: 5000,
      })
      setIsRefreshing(false)
    }
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground mt-2">
          Manage your Stripe account and payment settings
        </p>
      </div>

      {/* Connection Status */}
      <ConnectionStatus stripeAccount={stripeAccount} />

      {/* Test Mode: Complete Onboarding */}
      {isRestricted && (
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            Account Setup Required
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
            Your Stripe account is connected but needs additional information to accept payments.
            Click below to complete the setup process through Stripe's secure onboarding flow.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleCompleteOnboarding}
              disabled={isActivating}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isActivating ? 'Redirecting...' : 'Complete Account Setup'}
            </button>
            <button
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-yellow-900 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
            </button>
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-3">
            Already completed setup on Stripe? Click "Refresh Status" to sync your account status.
          </p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 mt-6">
        {!isConnected ? (
          /* Not Connected State */
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Connect Your Stripe Account</h2>
            <p className="text-muted-foreground mb-6">
              Connect your Stripe account to start accepting payments from customers.
              You will be redirected to Stripe to complete the connection.
            </p>
            <ConnectStripeButton userId={user.id} />
          </div>
        ) : (
          /* Connected State */
          <>
            {/* Payment Settings */}
            <PaymentSettingsCard
              paymentSettings={paymentSettings}
              onUpdate={setPaymentSettings}
            />

            {/* Analytics Preview */}
            <AnalyticsPreview stripeAccount={stripeAccount} />

            {/* Disconnect Option */}
            <div className="bg-muted/50 border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Disconnect Account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Disconnecting will prevent you from accepting new payments. Existing orders will not be affected.
              </p>
              <DisconnectButton onDisconnect={() => setStripeAccount(null)} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
