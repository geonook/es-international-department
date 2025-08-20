/**
 * Current User Information API
 * Current User Information API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: 'Please log in first' 
        },
        { status: 401 }
      )
    }

    // Get complete user information from database
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
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
          error: 'User not found',
          message: 'User does not exist' 
        },
        { status: 404 }
      )
    }

    // Note: 不再檢查 isActive 狀態，讓前端根據狀態決定顯示內容
    // 這樣待審核用戶也能通過認證檢查，避免無限循環

    // Prepare user role data
    const userRoles = user.userRoles.map(userRole => userRole.role.name)

    // Return user information (excluding sensitive information)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        roles: userRoles,
        avatar: user.avatarUrl,
        phone: user.phone,
        isActive: user.isActive, // 新增 isActive 欄位讓前端判斷狀態
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt
      }
    })

  } catch (error) {
    console.error('User Info API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Update user information
export async function PUT(request: NextRequest) {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: 'Please log in first' 
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      displayName, 
      phone
    } = body

    // Update user information
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        displayName: displayName || undefined,
        phone: phone || undefined,
        updatedAt: new Date()
      },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    // Prepare user role data
    const userRoles = updatedUser.userRoles.map(userRole => userRole.role.name)

    return NextResponse.json({
      success: true,
      message: 'Personal information updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        displayName: updatedUser.displayName,
        roles: userRoles,
        avatar: updatedUser.avatarUrl,
        phone: updatedUser.phone,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        lastLoginAt: updatedUser.lastLoginAt,
        isActive: updatedUser.isActive
      }
    })

  } catch (error) {
    console.error('Update User Info API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Update failed, please try again later' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Disallowed methods
export async function POST() {
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