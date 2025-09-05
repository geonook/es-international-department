/**
 * Authentication Refresh Token API
 * JWT Token refresh API endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  refreshAccessToken, 
  getRefreshTokenFromRequest, 
  setAuthCookies,
  AUTH_ERRORS 
} from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/refresh
 * Use refresh token to get new access token
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = getRefreshTokenFromRequest()
    
    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: 'Refresh token required'
        },
        { status: 401 }
      )
    }

    // Refresh access token
    const tokenPair = await refreshAccessToken(refreshToken)
    
    if (!tokenPair) {
      return NextResponse.json(
        {
          success: false,
          error: AUTH_ERRORS.INVALID_REFRESH_TOKEN,
          message: 'Refresh token is invalid or expired'
        },
        { status: 401 }
      )
    }

    // Set new authentication cookies
    setAuthCookies(tokenPair)

    return NextResponse.json({
      success: true,
      message: 'Token refresh successful',
      data: {
        accessToken: tokenPair.accessToken,
        // Don't return refresh token to frontend, maintain security
      }
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Token refresh failed',
        message: 'Token refresh failed'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/refresh
 * Check if refresh token is valid
 */
export async function GET(request: NextRequest) {
  try {
    const refreshToken = getRefreshTokenFromRequest()
    
    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: 'Refresh token required'
        },
        { status: 401 }
      )
    }

    // Verify refresh token (don't generate new token)
    const { verifyRefreshToken } = await import('@/lib/auth')
    const payload = await verifyRefreshToken(refreshToken)
    
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: AUTH_ERRORS.INVALID_REFRESH_TOKEN,
          message: 'Refresh token is invalid or expired'
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Refresh token is valid',
      data: {
        userId: payload.userId,
        expiresAt: payload.exp
      }
    })

  } catch (error) {
    console.error('Refresh token validation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        message: 'Token validation failed'
      },
      { status: 500 }
    )
  }
}