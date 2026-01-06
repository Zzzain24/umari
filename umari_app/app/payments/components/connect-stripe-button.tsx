"use client"

import { Button } from '@/components/ui/button'

interface ConnectStripeButtonProps {
  userId: string
}

export function ConnectStripeButton({ userId }: ConnectStripeButtonProps) {
  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID
    const redirectUri = `${window.location.origin}/api/stripe/oauth/callback`

    // Debug logging
    console.log('🔍 Stripe OAuth Debug:', {
      hasClientId: !!clientId,
      clientIdPrefix: clientId?.substring(0, 5),
      clientIdLength: clientId?.length,
      origin: window.location.origin,
      redirectUri: redirectUri,
      userId: userId,
    })

    // Check if client ID exists
    if (!clientId) {
      console.error('❌ NEXT_PUBLIC_STRIPE_CLIENT_ID is not set!')
      alert('Error: Stripe Client ID is missing. Please check your environment variables in Vercel.')
      return
    }

    // Validate client ID format
    if (!clientId.startsWith('ca_')) {
      console.error('❌ Invalid client ID format. Should start with "ca_"')
      alert('Error: Invalid Stripe Client ID format. Please verify your NEXT_PUBLIC_STRIPE_CLIENT_ID.')
      return
    }

    const params = new URLSearchParams({
      response_type: 'code', // Required by Stripe OAuth
      client_id: clientId,
      state: userId, // For verification
      scope: 'read_write',
      redirect_uri: redirectUri,
    })

    const stripeOAuthUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`

    console.log('✅ Redirecting to Stripe:', stripeOAuthUrl)

    window.location.href = stripeOAuthUrl
  }

  return (
    <Button onClick={handleConnect} size="lg" className="w-full md:w-auto">
      Connect with Stripe
    </Button>
  )
}
