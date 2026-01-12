import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  // Check for error parameters first (Supabase redirects with errors for expired/invalid links)
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')

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
    // Create response object first
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(`${origin}/confirm-email?error=invalid_token`)
    }

    if (data?.session) {
      // Session created successfully
      return response
    }

    // No session data returned
    return NextResponse.redirect(`${origin}/confirm-email?error=invalid_token`)
  }

  // Return the user to an error page with instructions if no code
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

