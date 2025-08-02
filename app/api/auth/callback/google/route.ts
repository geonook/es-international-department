/**
 * Google OAuth Callback API
 * Google OAuth 回調處理 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { 
  exchangeCodeForTokens, 
  verifyGoogleToken, 
  assignRoleByEmailDomain 
} from '@/lib/google-oauth'
import { generateTokenPair, setAuthCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/auth/callback/google
 * 處理 Google OAuth 回調
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // 檢查是否有錯誤
    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(new URL('/login?error=oauth_error', request.url))
    }

    // 檢查必要參數
    if (!code || !state) {
      return NextResponse.redirect(new URL('/login?error=missing_parameters', request.url))
    }

    // 驗證 CSRF 狀態參數
    const cookieStore = cookies()
    const storedState = cookieStore.get('oauth-state')?.value
    
    if (!storedState || storedState !== state) {
      console.error('OAuth state mismatch:', { stored: storedState, received: state })
      return NextResponse.redirect(new URL('/login?error=state_mismatch', request.url))
    }

    // 交換授權碼獲取令牌
    const tokens = await exchangeCodeForTokens(code)
    
    if (!tokens.idToken) {
      return NextResponse.redirect(new URL('/login?error=no_id_token', request.url))
    }

    // 驗證 ID Token 並獲取用戶資訊
    const googleUser = await verifyGoogleToken(tokens.idToken)
    
    if (!googleUser || !googleUser.email || !googleUser.verified_email) {
      return NextResponse.redirect(new URL('/login?error=invalid_user_info', request.url))
    }

    // 檢查用戶是否已存在
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
      include: {
        userRoles: {
          include: {
            role: true
          }
        },
        accounts: true
      }
    })

    let isNewUser = false

    if (user) {
      // 現有用戶 - 檢查是否已連結 Google 帳戶
      const existingGoogleAccount = user.accounts.find(
        account => account.provider === 'google'
      )

      if (!existingGoogleAccount) {
        // 連結 Google 帳戶到現有用戶
        await prisma.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: googleUser.id,
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            id_token: tokens.idToken,
            expires_at: tokens.expiryDate ? Math.floor(tokens.expiryDate / 1000) : null,
            token_type: 'bearer',
            scope: 'email profile'
          }
        })

        // 更新用戶的 Google 資訊
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            provider: user.provider === 'email' ? 'mixed' : 'google',
            avatarUrl: googleUser.picture || user.avatarUrl,
            emailVerified: true,
            lastLoginAt: new Date()
          },
          include: {
            userRoles: {
              include: {
                role: true
              }
            }
          }
        })
      } else {
        // 更新現有 Google 帳戶的 token
        await prisma.account.update({
          where: { id: existingGoogleAccount.id },
          data: {
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            id_token: tokens.idToken,
            expires_at: tokens.expiryDate ? Math.floor(tokens.expiryDate / 1000) : null,
          }
        })

        // 更新最後登入時間
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            avatarUrl: googleUser.picture || user.avatarUrl
          },
          include: {
            userRoles: {
              include: {
                role: true
              }
            }
          }
        })
      }
    } else {
      // 新用戶 - 創建帳戶
      isNewUser = true
      
      // 根據 email 域名分配角色
      const defaultRole = assignRoleByEmailDomain(googleUser.email)
      
      // 查找或創建角色
      let role = await prisma.role.findUnique({
        where: { name: defaultRole }
      })

      if (!role) {
        // 如果角色不存在，創建基本角色 (這裡假設至少有 parent 角色)
        role = await prisma.role.findUnique({
          where: { name: 'parent' }
        })
      }

      // 使用事務創建用戶和相關記錄
      user = await prisma.$transaction(async (tx) => {
        // 創建用戶
        const newUser = await tx.user.create({
          data: {
            email: googleUser.email.toLowerCase(),
            firstName: googleUser.given_name,
            lastName: googleUser.family_name,
            displayName: googleUser.name,
            avatarUrl: googleUser.picture,
            googleId: googleUser.id,
            provider: 'google',
            providerAccountId: googleUser.id,
            emailVerified: true,
            isActive: true,
            lastLoginAt: new Date()
          }
        })

        // 創建 OAuth 帳戶記錄
        await tx.account.create({
          data: {
            userId: newUser.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: googleUser.id,
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            id_token: tokens.idToken,
            expires_at: tokens.expiryDate ? Math.floor(tokens.expiryDate / 1000) : null,
            token_type: 'bearer',
            scope: 'email profile'
          }
        })

        // 分配角色
        if (role) {
          await tx.userRole.create({
            data: {
              userId: newUser.id,
              roleId: role.id,
              assignedBy: newUser.id // 自動分配
            }
          })
        }

        // 重新查詢用戶包含角色資訊
        return await tx.user.findUnique({
          where: { id: newUser.id },
          include: {
            userRoles: {
              include: {
                role: true
              }
            }
          }
        })
      })
    }

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=user_creation_failed', request.url))
    }

    // 準備 JWT payload
    const userForJWT = {
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      displayName: user.displayName || undefined,
      roles: user.userRoles.map(ur => ur.role.name)
    }

    // 生成 JWT token pair
    const tokenPair = await generateTokenPair(userForJWT)
    setAuthCookies(tokenPair)

    // 清除 OAuth 相關 cookies
    const response = NextResponse.redirect(
      new URL(
        isNewUser ? '/welcome' : (cookieStore.get('oauth-redirect')?.value || '/admin'),
        request.url
      )
    )
    
    response.cookies.delete('oauth-state')
    response.cookies.delete('oauth-redirect')

    return response

  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(new URL('/login?error=oauth_callback_failed', request.url))
  }
}