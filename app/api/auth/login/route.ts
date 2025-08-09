/**
 * Authentication Login API
 * User Login Authentication API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateJWT, verifyPassword, setAuthCookie, AUTH_ERRORS } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and password are required',
          message: 'Email and password are required fields' 
        },
        { status: 400 }
      )
    }

    // Find user from database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.INVALID_CREDENTIALS,
          message: 'Invalid login credentials' 
        },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash || '')
    if (!isValidPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.INVALID_CREDENTIALS,
          message: 'Invalid login credentials' 
        },
        { status: 401 }
      )
    }

    // Check account status
    if (!user.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Account is deactivated',
          message: 'Account has been deactivated, please contact administrator' 
        },
        { status: 403 }
      )
    }

    // Prepare user role data
    const userRoles = user.userRoles.map(userRole => userRole.role.name)

    // Create JWT Token
    const token = await generateJWT({
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      displayName: user.displayName || undefined,
      roles: userRoles
    })

    // Set authentication cookie
    setAuthCookie(token)

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Return success response (excluding sensitive information)
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        roles: userRoles,
        avatar: user.avatarUrl,
        createdAt: user.createdAt,
        lastLoginAt: new Date()
      }
    })

  } catch (error) {
    console.error('Login API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Internal server error, please try again later' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
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