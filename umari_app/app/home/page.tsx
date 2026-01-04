import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HomeContent } from "./home-content"
import { Navbar } from "@/components/navbar"

export default async function HomePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <HomeContent />
    </div>
  )
}

