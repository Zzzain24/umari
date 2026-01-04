import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileContent } from "./profile-content"
import { Navbar } from "@/components/navbar"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile data from the users table
  const { data: userData, error } = await supabase
    .from('users')
    .select('first_name, last_name, email')
    .eq('id', user.id)
    .single()

  if (error || !userData) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <ProfileContent userData={userData} />
    </div>
  )
}
