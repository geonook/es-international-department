/**
 * Reset Password API
 * Password reset API endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/reset-password
 * Reset user password with token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, resetToken, newPassword } = body

    // Basic validation
    if (!email || !resetToken || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Email, reset token and new password are required fields'
        },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid password',
          message: passwordError
        },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid reset request',
          message: 'Invalid reset request'
        },
        { status: 400 }
      )
    }

    // Verify reset token
    const resetSession = await prisma.userSession.findFirst({
      where: {
        userId: user.id,
        sessionToken: resetToken,
        userAgent: 'password-reset',
        expiresAt: { gt: new Date() }
      }
    })

    if (!resetSession) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired token',
          message: 'Reset token is invalid or expired'
        },
        { status: 400 }
      )
    }

    // Check if new password is same as current password
    if (user.passwordHash) {
      const { verifyPassword } = await import('@/lib/auth')
      const isSamePassword = await verifyPassword(newPassword, user.passwordHash)
      
      if (isSamePassword) {
        return NextResponse.json(
          {
            success: false,
            error: 'Same password',
            message: 'New password cannot be the same as current password'
          },
          { status: 400 }
        )
      }
    }

    // Update password
    const newPasswordHash = await hashPassword(newPassword)
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      }
    })

    // Clear all reset tokens and active sessions (force re-login)
    await Promise.all([
      // Clear password reset tokens
      prisma.userSession.deleteMany({
        where: {
          userId: user.id,
          userAgent: 'password-reset'
        }
      }),
      // Clear all user sessions (optional, increases security)
      prisma.userSession.deleteMany({
        where: {
          userId: user.id,
          userAgent: { not: 'password-reset' }
        }
      })
    ])

    // Log password change
    console.log(`Password reset completed for user: ${user.email} at ${new Date().toISOString()}`)

    return NextResponse.json({
      success: true,
      message: 'Password reset successful, please log in with your new password',
      data: {
        email: user.email,
        resetAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Service error occurred, please try again later'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/reset-password
 * Validate if reset token is valid
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const resetToken = searchParams.get('token')

    if (!email || !resetToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing parameters',
          message: 'Missing required parameters'
        },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          message: 'Invalid reset request'
        },
        { status: 400 }
      )
    }

    // Verify reset token
    const resetSession = await prisma.userSession.findFirst({
      where: {
        userId: user.id,
        sessionToken: resetToken,
        userAgent: 'password-reset',
        expiresAt: { gt: new Date() }
      }
    })

    if (!resetSession) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired token',
          message: 'Reset token is invalid or expired'
        },
        { status: 400 }
      )
    }

    // Return token validity information
    return NextResponse.json({
      success: true,
      message: 'Reset token is valid',
      data: {
        email: user.email,
        expiresAt: resetSession.expiresAt,
        remainingTime: Math.max(0, resetSession.expiresAt.getTime() - Date.now())
      }
    })

  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Service error occurred, please try again later'
      },
      { status: 500 }
    )
  }
}

/**
 * Password strength validation
 */
function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password cannot be empty'
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }

  if (password.length > 128) {
    return 'Password cannot exceed 128 characters'
  }

  // Check if contains at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)

  if (!hasLetter || !hasNumber) {
    return 'Password must contain at least one letter and one number'
  }

  // Check common weak passwords
  const weakPasswords = [
    '12345678', 'password', 'password123', 'admin123',
    'qwerty123', '87654321', 'abc12345', '123456789'
  ]

  if (weakPasswords.includes(password.toLowerCase())) {
    return 'Password is too simple, please choose a more secure password'
  }

  return null
}