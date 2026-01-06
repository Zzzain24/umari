"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { updatePaymentSettings } from '../actions'
import { useToast } from '@/hooks/use-toast'
import type { PaymentSettings } from '@/lib/types'

interface PaymentSettingsCardProps {
  paymentSettings: PaymentSettings | null
  onUpdate: (settings: PaymentSettings) => void
}

export function PaymentSettingsCard({ paymentSettings, onUpdate }: PaymentSettingsCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const handleSave = async (formData: FormData) => {
    const result = await updatePaymentSettings(formData)

    if (result.success && result.data) {
      onUpdate(result.data)
      setIsEditing(false)
      toast({
        title: 'Settings Updated',
        description: 'Your payment settings have been saved.',
      })
    } else {
      toast({
        title: 'Update Failed',
        description: result.error || 'Failed to update settings',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Payment Settings</h2>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <form action={handleSave} className="space-y-4">
          <div>
            <Label className="mb-2 block">Monetization Model</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="monetization_model"
                  value="application_fee"
                  defaultChecked={paymentSettings?.monetization_model === 'application_fee' || !paymentSettings}
                  className="w-4 h-4"
                />
                <span>Application Fee ({paymentSettings?.application_fee_percentage || 2.0}%)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer opacity-50">
                <input
                  type="radio"
                  name="monetization_model"
                  value="subscription"
                  disabled
                  className="w-4 h-4"
                />
                <span>Subscription (Coming Soon)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="monetization_model"
                  value="none"
                  defaultChecked={paymentSettings?.monetization_model === 'none'}
                  className="w-4 h-4"
                />
                <span>No Fee (Free)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Revenue Model:</span>
            <span className="font-medium capitalize">
              {paymentSettings?.monetization_model?.replace('_', ' ') || 'Not Set'}
            </span>
          </div>
          {paymentSettings?.monetization_model === 'application_fee' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee:</span>
              <span className="font-medium">{paymentSettings.application_fee_percentage}%</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Currency:</span>
            <span className="font-medium uppercase">{paymentSettings?.default_currency || 'USD'}</span>
          </div>
        </div>
      )}
    </div>
  )
}
