import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  
  // Check for error parameters first (Supabase redirects with errors)
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')
  
  if (error || errorCode) {
    // Supabase sent an error, redirect to confirm email page
    return NextResponse.redirect(`${origin}/confirm-email?error=invalid_token`)
  }
  
  // Check for code parameter (Supabase email confirmation uses codes)
  const code = searchParams.get('code')
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}/home`)
    }
    
    // If exchange fails, redirect with error
    return NextResponse.redirect(`${origin}/confirm-email?error=invalid_token`)
  }
  
  // Handle token-based confirmation
  const token = searchParams.get('token')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  
  // Also check for hash fragment (Supabase sometimes uses this)
  const hash = request.url.split('#')[1]
  let hashParams: URLSearchParams | null = null
  if (hash) {
    hashParams = new URLSearchParams(hash)
  }

  // Get token from query params or hash fragment
  const confirmationToken = tokenHash || token || hashParams?.get('token_hash') || hashParams?.get('token')
  // For email signup confirmations, type is 'signup', not 'email'
  const confirmationType = type || hashParams?.get('type') || 'signup'

  if (confirmationToken) {
    const supabase = await createClient()
    
    // Try verifyOtp with token_hash first (standard email confirmation)
    if (tokenHash || hashParams?.get('token_hash')) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: confirmationToken,
        type: confirmationType as any,
      })

      if (!error) {
        return NextResponse.redirect(`${origin}/home`)
      }
    }

    // Try verifyOtp with token (alternative format)
    // For token-based, use 'signup' type which doesn't require email
    if (token || hashParams?.get('token')) {
      const tokenType = confirmationType === 'email' ? 'signup' : confirmationType
      const { error } = await supabase.auth.verifyOtp({
        token: confirmationToken,
        type: tokenType as 'signup' | 'email_change' | 'recovery',
      } as any)

      if (!error) {
        return NextResponse.redirect(`${origin}/home`)
      }
    }
  }

  // If no valid token/code found or verification fails, redirect to confirm email page with error
  return NextResponse.redirect(`${origin}/confirm-email?error=invalid_token`)
}

