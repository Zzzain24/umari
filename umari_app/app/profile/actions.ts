"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import Stripe from 'stripe'

type DeleteAccountResponse =
  | { success: true }
  | { success: false; error: string }

// System account ID for deleted businesses
const DELETED_BUSINESS_ID = '00000000-0000-0000-0000-000000000000'

export async function deleteUserAccount(
  userId: string
): Promise<DeleteAccountResponse> {
  try {
    const supabase = await createClient()

    // Verify the authenticated user matches the ID being deleted
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      }
    }

    if (user.id !== userId) {
      return {
        success: false,
        error: "Unauthorized: Cannot delete another user's account",
      }
    }

    // Check if business has orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('business_user_id', userId)
      .limit(1)

    const hasOrders = orders && orders.length > 0

    if (hasOrders) {
      // Transfer orders to system account (preserves referential integrity)
      // The business_name and business_email columns in orders preserve the business info
      const { error: transferError } = await supabase
        .from('orders')
        .update({ business_user_id: DELETED_BUSINESS_ID })
        .eq('business_user_id', userId)

      if (transferError) {
        console.error('Error transferring orders:', transferError)
        return {
          success: false,
          error: 'Failed to transfer order history'
        }
      }
    }

    // Delete Stripe account connection (if exists)
    const { data: stripeAccount } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id')
      .eq('user_id', userId)
      .single()

    if (stripeAccount) {
      // Deauthorize Stripe account
      const secretKey = process.env.STRIPE_SECRET_KEY
      const clientId = process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID

      if (secretKey && clientId) {
        try {
          const stripe = new Stripe(secretKey, {
            apiVersion: '2024-12-18.acacia',
          })

          await stripe.oauth.deauthorize({
            client_id: clientId,
            stripe_user_id: stripeAccount.stripe_account_id,
          })
        } catch (stripeError) {
          // Log but don't fail - account deletion should proceed
          console.error('Stripe deauthorization error:', stripeError)
        }
      }

      // Delete Stripe account record
      await supabase.from('stripe_accounts').delete().eq('user_id', userId)
    }

    // Delete payment settings
    await supabase.from('payment_settings').delete().eq('user_id', userId)

    // Delete menus (cascade will handle menu_items and menu_item_options)
    await supabase.from('menus').delete().eq('user_id', userId)

    // Delete user profile
    const { error: deleteUserError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId)

    if (deleteUserError) {
      console.error("Error deleting user:", deleteUserError)
      return {
        success: false,
        error: "Failed to delete user account",
      }
    }

    // Create admin client for auth deletion
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseServiceKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY")
      return {
        success: false,
        error: "Server configuration error",
      }
    }

    const adminClient = createAdminClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Delete from Supabase auth using admin client
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(
      userId
    )

    if (deleteAuthError) {
      console.error("Error deleting auth account:", deleteAuthError)
      return {
        success: false,
        error: "Failed to delete authentication account",
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error during account deletion:", error)
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    }
  }
}
