"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'

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

    // Get Stripe account
    const { data: stripeAccount, error: fetchError } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single()

    if (fetchError || !stripeAccount) {
      return { success: false, error: 'No Stripe account found' }
    }

    // Validate environment variables
    const clientId = process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID
    if (!clientId) {
      return { 
        success: false, 
        error: 'Server configuration error: NEXT_PUBLIC_STRIPE_CLIENT_ID is missing' 
      }
    }

    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      return { 
        success: false, 
        error: 'Server configuration error: STRIPE_SECRET_KEY is missing' 
      }
    }

    // Initialize Stripe
    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
    })

    // Deauthorize on Stripe
    await stripe.oauth.deauthorize({
      client_id: clientId,
      stripe_user_id: stripeAccount.stripe_account_id,
    })

    // Delete from database
    const { error: deleteError } = await supabase
      .from('stripe_accounts')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      return { success: false, error: 'Failed to delete account from database' }
    }

    revalidatePath('/payments')
    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to disconnect Stripe account',
    }
  }
}
