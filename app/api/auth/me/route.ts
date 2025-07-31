/**
 * Current User Information API
 * 當前使用者資訊 API 端點
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // 獲取當前認證使用者
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: '請先登入' 
        },
        { status: 401 }
      )
    }

    // 從資料庫獲取完整使用者資訊
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
          message: '使用者不存在' 
        },
        { status: 404 }
      )
    }

    // 檢查帳戶狀態
    if (!user.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Account is deactivated',
          message: '帳戶已停用' 
        },
        { status: 403 }
      )
    }

    // 準備使用者角色資料
    const userRoles = user.userRoles.map(userRole => userRole.role.name)

    // 回傳使用者資訊（不包含敏感資訊）
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
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        emergencyContact: user.emergencyContact,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        isActive: user.isActive
      }
    })

  } catch (error) {
    console.error('User Info API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: '伺服器內部錯誤' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// 更新使用者資訊
export async function PUT(request: NextRequest) {
  try {
    // 獲取當前認證使用者
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: '請先登入' 
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      displayName, 
      phone, 
      dateOfBirth, 
      address, 
      emergencyContact,
      preferences 
    } = body

    // 更新使用者資訊
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        displayName: displayName || undefined,
        phone: phone || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        address: address || undefined,
        emergencyContact: emergencyContact || undefined,
        preferences: preferences || undefined,
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

    // 準備使用者角色資料
    const userRoles = updatedUser.userRoles.map(userRole => userRole.role.name)

    return NextResponse.json({
      success: true,
      message: '個人資訊更新成功',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        displayName: updatedUser.displayName,
        roles: userRoles,
        avatar: updatedUser.avatarUrl,
        phone: updatedUser.phone,
        dateOfBirth: updatedUser.dateOfBirth,
        address: updatedUser.address,
        emergencyContact: updatedUser.emergencyContact,
        preferences: updatedUser.preferences,
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
        message: '更新失敗，請稍後再試' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// 不允許的方法
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