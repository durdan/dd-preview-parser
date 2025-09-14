import { NextRequest, NextResponse } from 'next/server'
import { loginRateLimiter } from '../lib/services/rate-limiter'

export async function rateLimitMiddleware(
  request: NextRequest,
  identifier: string
): Promise<NextResponse | null> {
  const limit = await loginRateLimiter.checkLimit(identifier)
  
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        resetTime: limit.resetTime
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': limit.resetTime.toString()
        }
      }
    )
  }

  return null
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  return request.ip || 'unknown'
}