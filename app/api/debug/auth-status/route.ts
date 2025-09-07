/**
 * Authentication Debug API
 * Temporary debug endpoint for troubleshooting Production 401 errors
 * ⚠️ REMOVE THIS ENDPOINT AFTER DEBUGGING IS COMPLETE
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCurrentUser, verifyJWT, getRefreshTokenFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/debug/auth-status
 * Debug authentication status and cookie information
 */
export async function GET(request: NextRequest) {
  // Only allow in development or with specific debug header
  const isDebugAllowed = process.env.NODE_ENV === 'development' || 
                        request.headers.get('x-debug-auth') === 'true'
  
  if (!isDebugAllowed) {
    return NextResponse.json(
      { error: 'Debug endpoint disabled' },
      { status: 403 }
    )
  }

  try {
    const cookieStore = cookies()
    const now = new Date().toISOString()
    
    // Get all cookies
    const allCookies = cookieStore.getAll()
    const authCookie = cookieStore.get('auth-token')
    const refreshCookie = cookieStore.get('refresh-token')
    
    // Get current user (if possible)
    let currentUser = null
    let userError = null
    try {
      currentUser = await getCurrentUser()
    } catch (error) {
      userError = error instanceof Error ? error.message : 'Unknown error'
    }
    
    // Verify tokens manually
    let accessTokenStatus = null
    let refreshTokenStatus = null
    
    if (authCookie?.value) {
      try {
        const payload = await verifyJWT(authCookie.value)
        accessTokenStatus = {
          valid: !!payload,
          userId: payload?.userId,
          email: payload?.email,
          roles: payload?.roles,
          expires: payload?.exp ? new Date(payload.exp * 1000).toISOString() : null,
          isExpired: payload ? Date.now() > payload.exp * 1000 : true
        }
      } catch (error) {
        accessTokenStatus = {
          valid: false,
          error: error instanceof Error ? error.message : 'Token verification failed'
        }
      }
    }
    
    if (refreshCookie?.value) {
      try {
        const { verifyRefreshToken } = await import('@/lib/auth')
        const payload = await verifyRefreshToken(refreshCookie.value)
        refreshTokenStatus = {
          valid: !!payload,
          userId: payload?.userId,
          tokenId: payload?.tokenId,
          expires: payload?.exp ? new Date(payload.exp * 1000).toISOString() : null,
          isExpired: payload ? Date.now() > payload.exp * 1000 : true
        }
      } catch (error) {
        refreshTokenStatus = {
          valid: false,
          error: error instanceof Error ? error.message : 'Refresh token verification failed'
        }
      }
    }
    
    // Environment info
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      hasCookieSecure: process.env.NODE_ENV === 'production',
      userAgent: request.headers.get('user-agent'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
    }
    
    // Request headers (security filtered)
    const requestHeaders = {
      'content-type': request.headers.get('content-type'),
      'cookie': '***filtered***', // Don't expose cookie values
      'origin': request.headers.get('origin'),
      'referer': request.headers.get('referer'),
      'user-agent': request.headers.get('user-agent')?.substring(0, 100) + '...',
    }
    
    const debugInfo = {
      timestamp: now,
      environment: envInfo,
      cookies: {
        total: allCookies.length,
        authToken: {
          exists: !!authCookie,
          length: authCookie?.value?.length || 0,
          status: accessTokenStatus
        },
        refreshToken: {
          exists: !!refreshCookie,
          length: refreshCookie?.value?.length || 0,
          status: refreshTokenStatus
        },
        allCookieNames: allCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
      },
      authentication: {
        currentUser: currentUser ? {
          id: currentUser.id,
          email: currentUser.email,
          roles: currentUser.roles
        } : null,
        error: userError,
        isAuthenticated: !!currentUser
      },
      request: {
        method: request.method,
        url: request.url,
        headers: requestHeaders
      }
    }
    
    return NextResponse.json({
      success: true,
      debug: debugInfo,
      recommendations: generateDebugRecommendations(debugInfo)
    })
    
  } catch (error) {
    console.error('Auth debug error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Debug failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Generate debug recommendations based on current state
 */
function generateDebugRecommendations(debugInfo: any): string[] {
  const recommendations: string[] = []
  
  if (!debugInfo.cookies.authToken.exists) {
    recommendations.push('🔧 No auth-token cookie found - user may need to log in again')
  } else if (debugInfo.cookies.authToken.status?.isExpired) {
    recommendations.push('🔧 Access token has expired - refresh token flow should be attempted')
  } else if (!debugInfo.cookies.authToken.status?.valid) {
    recommendations.push('🔧 Access token is invalid - check JWT secret and token format')
  }
  
  if (!debugInfo.cookies.refreshToken.exists) {
    recommendations.push('🔧 No refresh-token cookie found - user will need to re-authenticate')
  } else if (debugInfo.cookies.refreshToken.status?.isExpired) {
    recommendations.push('🔧 Refresh token has expired - user must log in again')
  }
  
  if (debugInfo.environment.NODE_ENV === 'production' && !debugInfo.environment.NEXTAUTH_URL?.startsWith('https://')) {
    recommendations.push('🔧 NEXTAUTH_URL should use HTTPS in production')
  }
  
  if (debugInfo.cookies.total === 0) {
    recommendations.push('🔧 No cookies found - check cookie domain and HTTPS settings')
  }
  
  if (!debugInfo.authentication.isAuthenticated && debugInfo.authentication.error) {
    recommendations.push(`🔧 Authentication error: ${debugInfo.authentication.error}`)
  }
  
  return recommendations
}

/**
 * POST /api/debug/auth-status
 * Test token refresh functionality
 */
export async function POST(request: NextRequest) {
  const isDebugAllowed = process.env.NODE_ENV === 'development' || 
                        request.headers.get('x-debug-auth') === 'true'
  
  if (!isDebugAllowed) {
    return NextResponse.json(
      { error: 'Debug endpoint disabled' },
      { status: 403 }
    )
  }

  try {
    const refreshToken = getRefreshTokenFromRequest()
    
    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        error: 'No refresh token available for testing'
      })
    }
    
    // Test refresh flow
    const { refreshAccessToken } = await import('@/lib/auth')
    const newTokenPair = await refreshAccessToken(refreshToken)
    
    if (newTokenPair) {
      return NextResponse.json({
        success: true,
        message: 'Token refresh successful',
        tokenPair: {
          accessToken: `${newTokenPair.accessToken.substring(0, 20)}...`,
          refreshToken: `${newTokenPair.refreshToken.substring(0, 20)}...`
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Token refresh failed'
      })
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Refresh test failed'
    })
  }
}

// Only allow GET and POST methods
export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}