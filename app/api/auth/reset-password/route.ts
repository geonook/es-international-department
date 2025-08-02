/**
 * Reset Password API
 * 密碼重設 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

/**
 * POST /api/auth/reset-password
 * 重設密碼
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, resetToken, newPassword } = body

    // 基本驗證
    if (!email || !resetToken || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Email、重設碼和新密碼為必填欄位'
        },
        { status: 400 }
      )
    }

    // 驗證密碼強度
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

    // 查找使用者
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid reset request',
          message: '重設申請無效'
        },
        { status: 400 }
      )
    }

    // 驗證重設 token
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
          message: '重設碼無效或已過期'
        },
        { status: 400 }
      )
    }

    // 檢查新密碼是否與當前密碼相同
    if (user.passwordHash) {
      const { verifyPassword } = await import('@/lib/auth')
      const isSamePassword = await verifyPassword(newPassword, user.passwordHash)
      
      if (isSamePassword) {
        return NextResponse.json(
          {
            success: false,
            error: 'Same password',
            message: '新密碼不能與當前密碼相同'
          },
          { status: 400 }
        )
      }
    }

    // 更新密碼
    const newPasswordHash = await hashPassword(newPassword)
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      }
    })

    // 清除所有重設 token 和活躍會話 (強制重新登入)
    await Promise.all([
      // 清除密碼重設 token
      prisma.userSession.deleteMany({
        where: {
          userId: user.id,
          userAgent: 'password-reset'
        }
      }),
      // 清除所有使用者會話 (可選，增加安全性)
      prisma.userSession.deleteMany({
        where: {
          userId: user.id,
          userAgent: { not: 'password-reset' }
        }
      })
    ])

    // 記錄密碼變更日誌
    console.log(`Password reset completed for user: ${user.email} at ${new Date().toISOString()}`)

    return NextResponse.json({
      success: true,
      message: '密碼重設成功，請使用新密碼登入',
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
        message: '服務發生錯誤，請稍後再試'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/reset-password
 * 驗證重設 token 是否有效
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
          message: '缺少必要參數'
        },
        { status: 400 }
      )
    }

    // 查找使用者
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          message: '無效的重設申請'
        },
        { status: 400 }
      )
    }

    // 驗證重設 token
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
          message: '重設碼無效或已過期'
        },
        { status: 400 }
      )
    }

    // 返回 token 有效性資訊
    return NextResponse.json({
      success: true,
      message: '重設碼有效',
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
        message: '服務發生錯誤，請稍後再試'
      },
      { status: 500 }
    )
  }
}

/**
 * 密碼強度驗證
 */
function validatePassword(password: string): string | null {
  if (!password) {
    return '密碼不能為空'
  }

  if (password.length < 8) {
    return '密碼長度至少 8 個字元'
  }

  if (password.length > 128) {
    return '密碼長度不能超過 128 個字元'
  }

  // 檢查是否包含至少一個字母和一個數字
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)

  if (!hasLetter || !hasNumber) {
    return '密碼必須包含至少一個字母和一個數字'
  }

  // 檢查常見弱密碼
  const weakPasswords = [
    '12345678', 'password', 'password123', 'admin123',
    'qwerty123', '87654321', 'abc12345', '123456789'
  ]

  if (weakPasswords.includes(password.toLowerCase())) {
    return '密碼過於簡單，請選擇更安全的密碼'
  }

  return null
}