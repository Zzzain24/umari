"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { disconnectStripeAccount } from '../actions'

interface DisconnectButtonProps {
  onDisconnect: () => void
}

export function DisconnectButton({ onDisconnect }: DisconnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDisconnect = async () => {
    setIsLoading(true)
    const result = await disconnectStripeAccount()

    if (result.success) {
      toast({
        title: 'Disconnected',
        description: 'Your Stripe account has been disconnected.',
      })
      onDisconnect()
      window.location.reload()
    } else {
      toast({
        title: 'Disconnect Failed',
        description: result.error || 'Failed to disconnect account',
        variant: 'destructive',
      })
    }
    setIsLoading(false)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isLoading}>
          {isLoading ? 'Disconnecting...' : 'Disconnect Stripe'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disconnect Stripe Account?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to disconnect your Stripe account? This will prevent you from
            accepting new payments. Existing orders will not be affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDisconnect} className="bg-destructive text-destructive-foreground">
            Disconnect
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
