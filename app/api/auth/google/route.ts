/**
 * Google OAuth Authentication API
 * Google OAuth Authentication API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateGoogleAuthUrl, generateSecureState, validateGoogleOAuthConfig } from '@/lib/google-oauth'

/**
 * GET /api/auth/google
 * Initialize Google OAuth authentication flow
 */
export async function GET(request: NextRequest) {
  try {
    // Verify Google OAuth configuration
    if (!validateGoogleOAuthConfig()) {
      return NextResponse.json(
        {
          success: false,
          error: 'OAuth configuration missing',
          message: 'Google OAuth configuration incomplete, please check environment variables'
        },
        { status: 500 }
      )
    }

    // Get redirect URL from query parameters
    const { searchParams } = new URL(request.url)
    const redirectUrl = searchParams.get('redirect') || '/admin'

    // Generate secure state parameter
    const state = generateSecureState()

    // Store state and redirect URL in cookies
    const response = NextResponse.redirect(generateGoogleAuthUrl(state))
    
    // Set state cookie (for CSRF protection)
    response.cookies.set('oauth-state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutes
      path: '/'
    })

    // Set redirect URL cookie
    response.cookies.set('oauth-redirect', redirectUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutes
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Google OAuth initialization error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'OAuth initialization failed',
        message: 'OAuth initialization failed, please try again later'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/auth/google
 * Handle frontend-initiated Google OAuth requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { redirect } = body

    // Verify configuration
    if (!validateGoogleOAuthConfig()) {
      return NextResponse.json(
        {
          success: false,
          error: 'OAuth configuration missing',
          message: 'Google OAuth configuration incomplete'
        },
        { status: 500 }
      )
    }

    // Generate authentication URL
    const state = generateSecureState()
    const authUrl = generateGoogleAuthUrl(state)

    return NextResponse.json({
      success: true,
      data: {
        authUrl,
        state
      },
      message: 'Please go to Google to complete authentication'
    })

  } catch (error) {
    console.error('Google OAuth API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'OAuth request failed',
        message: 'OAuth request failed'
      },
      { status: 500 }
    )
  }
}