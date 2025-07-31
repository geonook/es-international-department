/**
 * Authentication Login API
 * 使用者登入認證 API 端點
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateJWT, verifyPassword, setAuthCookie, AUTH_ERRORS } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 驗證必要欄位
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and password are required',
          message: '電子郵件和密碼為必填欄位' 
        },
        { status: 400 }
      )
    }

    // 從資料庫查找使用者
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
          message: '無效的登入資訊' 
        },
        { status: 401 }
      )
    }

    // 驗證密碼
    const isValidPassword = await verifyPassword(password, user.passwordHash || '')
    if (!isValidPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.INVALID_CREDENTIALS,
          message: '無效的登入資訊' 
        },
        { status: 401 }
      )
    }

    // 檢查帳戶狀態
    if (!user.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Account is deactivated',
          message: '帳戶已停用，請聯繫管理員' 
        },
        { status: 403 }
      )
    }

    // 準備使用者角色資料
    const userRoles = user.userRoles.map(userRole => userRole.role.name)

    // 建立 JWT Token
    const token = await generateJWT({
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      displayName: user.displayName || undefined,
      roles: userRoles
    })

    // 設定認證 Cookie
    setAuthCookie(token)

    // 更新最後登入時間
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // 回傳成功回應（不包含敏感資訊）
    return NextResponse.json({
      success: true,
      message: '登入成功',
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
        message: '伺服器內部錯誤，請稍後再試' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// 只允許 POST 方法
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