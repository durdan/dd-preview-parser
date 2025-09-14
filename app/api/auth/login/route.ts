import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '../../../../lib/validation/auth'
import { authService } from '../../../../lib/services/auth'
import { rateLimitMiddleware, getClientIp } from '../../../../middleware/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    
    // Check rate limit
    const rateLimitResponse = await rateLimitMiddleware(request, `login_ip:${clientIp}`)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Authenticate user
    const result = await authService.authenticateUser(validatedData, clientIp)

    if (result.rateLimited) {
      return NextResponse.json(
        { error: result.error },
        { status: 429 }
      )
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: result.user
    })

  } catch (error) {
    console.error('Login API error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}