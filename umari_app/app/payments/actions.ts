"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type UpdateSettingsResponse =
  | { success: true; data: any }
  | { success: false; error: string }

export async function updatePaymentSettings(
  formData: FormData
): Promise<UpdateSettingsResponse> {
  try {
    const supabase = await createClient()

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const monetizationModel = formData.get('monetization_model') as string

    // Update settings
    const { data, error } = await supabase
      .from('payment_settings')
      .update({
        monetization_model: monetizationModel,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    revalidatePath('/payments')
    return { success: true, data }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update settings',
    }
  }
}

export async function disconnectStripeAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Call API route to handle Stripe deauthorization
    const response = await fetch('/api/stripe/deauthorize', {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('Failed to disconnect account')
    }

    revalidatePath('/payments')
    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to disconnect',
    }
  }
}
