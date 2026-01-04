import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  
  // Check for error parameters first (Supabase redirects with errors for expired/invalid links)
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  
  if (error || errorCode) {
    // If this is an email confirmation error, redirect to confirm email page
    // Otherwise, redirect to auth error page
    if (errorCode === 'otp_expired' || errorCode === 'email_not_confirmed') {
      return NextResponse.redirect(`${origin}/confirm-email?error=invalid_token`)
    }
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }
  
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    // If exchange fails and it's an email confirmation, redirect to confirm email page
    if (error.message?.includes('email') || error.message?.includes('expired')) {
      return NextResponse.redirect(`${origin}/confirm-email?error=invalid_token`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

