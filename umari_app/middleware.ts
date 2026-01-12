import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): void {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Disable unnecessary browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  // XSS protection (legacy but still useful)
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Content Security Policy - balanced for functionality
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https:; " +
    "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co; " +
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  )
}

/**
 * Check rate limit for API routes
 */
function checkRateLimit(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname

  // Only rate limit API routes
  if (!pathname.startsWith('/api/')) {
    return null
  }

  const clientIP = getClientIP(request.headers)

  // Determine rate limit config based on endpoint
  let config = RATE_LIMITS.api
  let identifier = `api:${clientIP}`

  if (pathname.includes('/orders/lookup') || pathname.includes('/checkout/')) {
    config = RATE_LIMITS.guest
    identifier = `guest:${clientIP}`
  } else if (pathname.includes('/orders/create')) {
    config = RATE_LIMITS.orders
    identifier = `orders:${clientIP}`
  } else if (pathname.includes('/auth/')) {
    config = RATE_LIMITS.auth
    identifier = `auth:${clientIP}`
  }

  const result = rateLimit(identifier, config)

  if (!result.success) {
    const response = NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
    response.headers.set('Retry-After', String(Math.ceil((result.resetTime - Date.now()) / 1000)))
    response.headers.set('X-RateLimit-Limit', String(result.limit))
    response.headers.set('X-RateLimit-Remaining', '0')
    addSecurityHeaders(response)
    return response
  }

  return null
}

export async function middleware(request: NextRequest) {
  // Check rate limits for API routes
  const rateLimitResponse = checkRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  // Add security headers to all responses
  addSecurityHeaders(supabaseResponse)

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

