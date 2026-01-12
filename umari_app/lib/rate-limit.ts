/**
 * Simple in-memory rate limiter for API protection
 * For production with multiple server instances, consider using Upstash Redis
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

interface RateLimitConfig {
  // Maximum number of requests allowed in the window
  limit: number
  // Time window in seconds
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address or user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and remaining requests
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const key = identifier

  const entry = rateLimitStore.get(key)

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs
    rateLimitStore.set(key, { count: 1, resetTime })
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime,
    }
  }

  // Increment count
  entry.count++

  // Check if over limit
  if (entry.count > config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Get client IP from request headers
 * Works with Vercel, Cloudflare, and direct connections
 */
export function getClientIP(headers: Headers): string {
  // Vercel/Cloudflare headers
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  // Cloudflare
  const cfConnectingIP = headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Direct connection fallback
  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  return 'unknown'
}

// Preset configurations for different endpoint types
export const RATE_LIMITS = {
  // Strict limit for sensitive guest endpoints (order lookup, checkout)
  guest: { limit: 20, windowSeconds: 60 }, // 20 requests per minute

  // Standard limit for authenticated API endpoints
  api: { limit: 100, windowSeconds: 60 }, // 100 requests per minute

  // Very strict limit for auth-related endpoints (login, signup)
  auth: { limit: 10, windowSeconds: 60 }, // 10 requests per minute

  // Limit for order creation (prevent spam orders)
  orders: { limit: 10, windowSeconds: 60 }, // 10 orders per minute
} as const
