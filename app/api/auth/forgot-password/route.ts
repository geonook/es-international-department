/**
 * Forgot Password API
 * 忘記密碼申請 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

/**
 * POST /api/auth/forgot-password
 * 申請密碼重設
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // 基本驗證
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing email',
          message: 'Email 為必填欄位'
        },
        { status: 400 }
      )
    }

    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
          message: 'Email 格式不正確'
        },
        { status: 400 }
      )
    }

    // 檢查使用者是否存在
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // 為了安全性，無論使用者是否存在都返回成功訊息
    // 但只有存在的使用者才會真正生成重設 token
    if (user && user.isActive) {
      // 生成 6 位數重設 token
      const resetToken = crypto.randomInt(100000, 999999).toString()
      const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 分鐘過期

      // 檢查是否已有未過期的重設 token
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
            message: '密碼重設申請已存在，請等待 15 分鐘後再試'
          },
          { status: 429 }
        )
      }

      // 清除舊的重設 token
      await prisma.userSession.deleteMany({
        where: {
          userId: user.id,
          userAgent: 'password-reset'
        }
      })

      // 創建新的重設 token
      await prisma.userSession.create({
        data: {
          userId: user.id,
          sessionToken: resetToken,
          expiresAt: tokenExpiry,
          userAgent: 'password-reset',
          ipAddress: getClientIP(request)
        }
      })

      // 在生產環境中，這裡應該發送郵件
      // 在開發/測試環境中，直接返回 token
      if (process.env.NODE_ENV === 'development') {
        console.log(`Password reset token for ${email}: ${resetToken}`)
        
        return NextResponse.json({
          success: true,
          message: '密碼重設申請成功',
          data: {
            resetToken, // 開發環境中直接返回 token
            expiresAt: tokenExpiry,
            development: true
          }
        })
      }
    }

    // 生產環境回應 (不洩露使用者是否存在)
    return NextResponse.json({
      success: true,
      message: '如果該 Email 存在，重設指示已發送至您的信箱',
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
        message: '服務發生錯誤，請稍後再試'
      },
      { status: 500 }
    )
  }
}

/**
 * 獲取客戶端 IP 地址
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