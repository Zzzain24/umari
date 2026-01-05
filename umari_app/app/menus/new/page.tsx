import type React from "react"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { MenuForm } from "./menu-form"

export default async function NewMenuPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <Suspense fallback={<div>Loading...</div>}>
        <MenuForm />
      </Suspense>
    </div>
  )
}

