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

    // Step 1: Handle Stripe deauthorization first (external API call)
    // This is done before the transaction since it's an external service
    const { data: stripeAccount } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id')
      .eq('user_id', userId)
      .single()

    if (stripeAccount) {
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
    }

    // Step 2: Delete all user data atomically using the database function
    // This ensures all database operations succeed or fail together
    const { error: rpcError } = await supabase.rpc('delete_user_account', {
      p_user_id: userId,
      p_system_account_id: DELETED_BUSINESS_ID,
    })

    if (rpcError) {
      console.error("Error in delete_user_account RPC:", rpcError)
      return {
        success: false,
        error: "Failed to delete user data",
      }
    }

    // Step 3: Delete from Supabase auth using admin client
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
