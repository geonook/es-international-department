/**
 * Forgot Password API
 * Forgot password request API
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Basic validation
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing email',
          message: 'Email is a required field'
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
          message: 'Invalid email format'
        },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // For security, always return success message regardless of whether user exists
    // But only existing users will actually get reset token generated
    if (user && user.isActive) {
      // Generate 6-digit reset token
      const resetToken = crypto.randomInt(100000, 999999).toString()
      const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes expiry

      // Check if there's already an unexpired reset token
      const existingReset = await prisma.userSession.findFirst({
        where: {
          userId: user.id,
          userAgent: 'password-reset',
          expiresAt: { gt: new Date() }
        }
      })

      if (existingReset) {
        return NextResponse.json(
          {
            success: false,
            error: 'Reset already requested',
            message: 'Password reset request already exists, please wait 15 minutes before trying again'
          },
          { status: 429 }
        )
      }

      // Clear old reset tokens
      await prisma.userSession.deleteMany({
        where: {
          userId: user.id,
          userAgent: 'password-reset'
        }
      })

      // Create new reset token
      await prisma.userSession.create({
        data: {
          userId: user.id,
          sessionToken: resetToken,
          expiresAt: tokenExpiry,
          userAgent: 'password-reset',
          ipAddress: getClientIP(request)
        }
      })

      // In production, email should be sent here
      // In development/test environment, return token directly
      if (process.env.NODE_ENV === 'development') {
        console.log(`Password reset token for ${email}: ${resetToken}`)
        
        return NextResponse.json({
          success: true,
          message: 'Password reset request successful',
          data: {
            resetToken, // Return token directly in development environment
            expiresAt: tokenExpiry,
            development: true
          }
        })
      }
    }

    // Production response (don't reveal whether user exists)
    return NextResponse.json({
      success: true,
      message: 'If the email exists, reset instructions have been sent to your mailbox',
      data: {
        development: false
      }
    })

  } catch (error) {
    console.error('Forgot password error:', error)
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
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return '127.0.0.1'
}