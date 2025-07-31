/**
 * Authentication Logout API
 * 使用者登出認證 API 端點
 */

import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookie, getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 檢查使用者是否已登入
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Not authenticated',
          message: '用戶未登入' 
        },
        { status: 401 }
      )
    }

    // 清除認證 Cookie
    clearAuthCookie()

    return NextResponse.json({
      success: true,
      message: '成功登出'
    })

  } catch (error) {
    console.error('Logout API Error:', error)
    
    // 即使發生錯誤，也要清除 Cookie
    clearAuthCookie()
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: '伺服器內部錯誤' 
      },
      { status: 500 }
    )
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