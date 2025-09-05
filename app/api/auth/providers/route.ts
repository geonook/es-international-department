/**
 * OAuth Providers API
 * Returns available OAuth providers configuration
 */

import { NextResponse } from 'next/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/providers
 * Returns available OAuth providers
 */
export async function GET() {
  try {
    const providers = {
      google: {
        id: 'google',
        name: 'Google',
        type: 'oauth',
        signinUrl: '/api/auth/google',
        callbackUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/auth/callback/google`
      }
    }

    return NextResponse.json(providers)
  } catch (error) {
    console.error('Error fetching providers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    )
  }
}