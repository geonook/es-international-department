/**
 * Authentication Refresh Token API
 * JWT Token 刷新 API 端點
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  refreshAccessToken, 
  getRefreshTokenFromRequest, 
  setAuthCookies,
  AUTH_ERRORS 
} from '@/lib/auth'

/**
 * POST /api/auth/refresh
 * 使用 refresh token 獲取新的 access token
 */
export async function POST(request: NextRequest) {
  try {
    // 從 cookies 獲取 refresh token
    const refreshToken = getRefreshTokenFromRequest()
    
    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: '需要 refresh token'
        },
        { status: 401 }
      )
    }

    // 刷新 access token
    const tokenPair = await refreshAccessToken(refreshToken)
    
    if (!tokenPair) {
      return NextResponse.json(
        {
          success: false,
          error: AUTH_ERRORS.INVALID_REFRESH_TOKEN,
          message: 'Refresh token 無效或已過期'
        },
        { status: 401 }
      )
    }

    // 設定新的認證 cookies
    setAuthCookies(tokenPair)

    return NextResponse.json({
      success: true,
      message: 'Token 刷新成功',
      data: {
        accessToken: tokenPair.accessToken,
        // 不返回 refresh token 給前端，保持安全性
      }
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Token refresh failed',
        message: 'Token 刷新失敗'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/refresh
 * 檢查 refresh token 是否有效
 */
export async function GET(request: NextRequest) {
  try {
    const refreshToken = getRefreshTokenFromRequest()
    
    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: '需要 refresh token'
        },
        { status: 401 }
      )
    }

    // 驗證 refresh token (不生成新 token)
    const { verifyRefreshToken } = await import('@/lib/auth')
    const payload = await verifyRefreshToken(refreshToken)
    
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: AUTH_ERRORS.INVALID_REFRESH_TOKEN,
          message: 'Refresh token 無效或已過期'
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Refresh token 有效',
      data: {
        userId: payload.userId,
        expiresAt: payload.exp
      }
    })

  } catch (error) {
    console.error('Refresh token validation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        message: 'Token 驗證失敗'
      },
      { status: 500 }
    )
  }
}