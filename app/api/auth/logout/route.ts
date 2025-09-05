/**
 * Authentication Logout API
 * User Logout Authentication API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookie, getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check if user is logged in
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Not authenticated',
          message: 'User not logged in' 
        },
        { status: 401 }
      )
    }

    // Clear authentication cookies
    clearAuthCookie()

    return NextResponse.json({
      success: true,
      message: 'Successfully logged out'
    })

  } catch (error) {
    console.error('Logout API Error:', error)
    
    // Clear cookies even if error occurs
    clearAuthCookie()
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}