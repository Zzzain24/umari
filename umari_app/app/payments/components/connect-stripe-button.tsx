"use client"

import { Button } from '@/components/ui/button'

interface ConnectStripeButtonProps {
  userId: string
}

export function ConnectStripeButton({ userId }: ConnectStripeButtonProps) {
  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID
    const redirectUri = `${window.location.origin}/api/stripe/oauth/callback`

    // Check if client ID exists
    if (!clientId) {
      alert('Error: Stripe Client ID is missing. Please check your environment variables.')
      return
    }

    // Validate client ID format
    if (!clientId.startsWith('ca_')) {
      alert('Error: Invalid Stripe Client ID format.')
      return
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      state: userId,
      scope: 'read_write',
      redirect_uri: redirectUri,
    })

    const stripeOAuthUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`
    window.location.href = stripeOAuthUrl
  }

  return (
    <Button onClick={handleConnect} size="lg" className="w-full md:w-auto">
      Connect with Stripe
    </Button>
  )
}
