/**
 * Google OAuth Authentication API
 * Google OAuth 認證 API 端點
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateGoogleAuthUrl, generateSecureState, validateGoogleOAuthConfig } from '@/lib/google-oauth'

/**
 * GET /api/auth/google
 * 初始化 Google OAuth 認證流程
 */
export async function GET(request: NextRequest) {
  try {
    // 驗證 Google OAuth 配置
    if (!validateGoogleOAuthConfig()) {
      return NextResponse.json(
        {
          success: false,
          error: 'OAuth configuration missing',
          message: 'Google OAuth 配置不完整，請檢查環境變數'
        },
        { status: 500 }
      )
    }

    // 從查詢參數獲取重定向 URL
    const { searchParams } = new URL(request.url)
    const redirectUrl = searchParams.get('redirect') || '/admin'

    // 生成安全的狀態參數
    const state = generateSecureState()

    // 將狀態和重定向 URL 存儲在 cookie 中
    const response = NextResponse.redirect(generateGoogleAuthUrl(state))
    
    // 設定狀態 cookie (用於 CSRF 保護)
    response.cookies.set('oauth-state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 分鐘
      path: '/'
    })

    // 設定重定向 URL cookie
    response.cookies.set('oauth-redirect', redirectUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 分鐘
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Google OAuth initialization error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'OAuth initialization failed',
        message: 'OAuth 初始化失敗，請稍後重試'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/auth/google
 * 處理前端發起的 Google OAuth 請求
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { redirect } = body

    // 驗證配置
    if (!validateGoogleOAuthConfig()) {
      return NextResponse.json(
        {
          success: false,
          error: 'OAuth configuration missing',
          message: 'Google OAuth 配置不完整'
        },
        { status: 500 }
      )
    }

    // 生成認證 URL
    const state = generateSecureState()
    const authUrl = generateGoogleAuthUrl(state)

    return NextResponse.json({
      success: true,
      data: {
        authUrl,
        state
      },
      message: '請前往 Google 完成認證'
    })

  } catch (error) {
    console.error('Google OAuth API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'OAuth request failed',
        message: 'OAuth 請求失敗'
      },
      { status: 500 }
    )
  }
}