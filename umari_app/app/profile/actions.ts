"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

type DeleteAccountResponse =
  | { success: true }
  | { success: false; error: string }

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

    // Delete from users table first
    const { error: deleteUserError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId)

    if (deleteUserError) {
      console.error("Error deleting from users table:", deleteUserError)
      return {
        success: false,
        error: "Failed to delete user data",
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
      console.error("Error deleting from auth:", deleteAuthError)
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
