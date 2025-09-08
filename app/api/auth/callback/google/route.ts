/**
 * Google OAuth Callback API
 * Google OAuth Callback Handler API
 */

import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
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
 * Handle Google OAuth callback
 */
export async function GET(request: NextRequest) {
  // Get the correct base URL from environment variable to avoid localhost:8080 issues
  const getBaseUrl = () => {
    const nextAuthUrl = process.env.NEXTAUTH_URL
    if (nextAuthUrl) {
      return nextAuthUrl
    }
    // Fallback based on environment
    if (process.env.NODE_ENV === 'production') {
      return 'https://kcislk-infohub.zeabur.app'
    }
    return 'http://localhost:3001'
  }
  
  const baseUrl = getBaseUrl()
  
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for errors
    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(new URL('/login?error=oauth_error', baseUrl))
    }

    // Check required parameters
    if (!code || !state) {
      return NextResponse.redirect(new URL('/login?error=missing_parameters', baseUrl))
    }

    // Verify CSRF state parameter
    const cookieStore = cookies()
    const storedState = cookieStore.get('oauth-state')?.value
    
    if (!storedState || storedState !== state) {
      console.error('OAuth state mismatch:', { stored: storedState, received: state })
      return NextResponse.redirect(new URL('/login?error=state_mismatch', baseUrl))
    }

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code)
    
    if (!tokens.idToken) {
      return NextResponse.redirect(new URL('/login?error=no_id_token', baseUrl))
    }

    // Verify ID Token and get user info
    const googleUser = await verifyGoogleToken(tokens.idToken)
    
    if (!googleUser || !googleUser.email || !googleUser.verified_email) {
      return NextResponse.redirect(new URL('/login?error=invalid_user_info', baseUrl))
    }

    // Check if user already exists
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
      // Existing user - check if Google account is already linked
      const existingGoogleAccount = user.accounts.find(
        account => account.provider === 'google'
      )

      if (!existingGoogleAccount) {
        // Link Google account to existing user
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

        // Update user's Google information
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
        // Update existing Google account tokens
        await prisma.account.update({
          where: { id: existingGoogleAccount.id },
          data: {
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            id_token: tokens.idToken,
            expires_at: tokens.expiryDate ? Math.floor(tokens.expiryDate / 1000) : null,
          }
        })

        // Update last login time
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
      // New user - create account
      isNewUser = true
      
      // Assign role based on email domain
      const defaultRole = assignRoleByEmailDomain(googleUser.email)
      
      // Find or create role
      let role = await prisma.role.findUnique({
        where: { name: defaultRole }
      })

      if (!role) {
        // If role doesn't exist, create basic role (assuming at least parent role exists)
        role = await prisma.role.findUnique({
          where: { name: 'parent' }
        })
      }

      // Use transaction to create user and related records
      user = await prisma.$transaction(async (tx) => {
        // Create user with active status and viewer role
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
            isActive: true, // 新用戶直接啟用（不需待審核）
            lastLoginAt: new Date()
          }
        })

        // Create OAuth account record
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

        // 自動分配角色給新用戶 - 分配預設 viewer 角色或依據域名分配適當角色
        if (role) {
          await tx.userRole.create({
            data: {
              userId: newUser.id,
              roleId: role.id,
              assignedBy: newUser.id // 系統自動分配
            }
          })
        }

        // Re-query user with role information
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
      return NextResponse.redirect(new URL('/login?error=user_creation_failed', baseUrl))
    }

    // Prepare JWT payload
    const userForJWT = {
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      displayName: user.displayName || undefined,
      roles: user.userRoles.map(ur => ur.role.name)
    }

    // 🔄 Enhanced JWT Token Generation with Retry Mechanism
    console.log(`🔐 Starting authentication token generation for user: ${user.email}`)
    
    // 重試配置
    const MAX_RETRIES = 3
    const RETRY_DELAY = 1000 // 1 second
    
    let authSuccess = false
    let lastError: Error | null = null
    
    // 主要 Token Pair 生成 (含重試)
    for (let attempt = 1; attempt <= MAX_RETRIES && !authSuccess; attempt++) {
      try {
        console.log(`🔄 Token pair generation attempt ${attempt}/${MAX_RETRIES}`)
        const tokenPair = await generateTokenPair(userForJWT)
        setAuthCookies(tokenPair)
        console.log(`✅ Token pair authentication successful on attempt ${attempt}`)
        authSuccess = true
        break
      } catch (tokenError) {
        lastError = tokenError instanceof Error ? tokenError : new Error(String(tokenError))
        console.error(`❌ Token pair generation attempt ${attempt} failed:`, {
          error: lastError.message,
          userId: user.id,
          userEmail: user.email,
          attempt: attempt,
          stack: lastError.stack
        })
        
        if (attempt < MAX_RETRIES) {
          console.log(`⏳ Waiting ${RETRY_DELAY}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        }
      }
    }
    
    // 如果主要方法失敗，嘗試備用 JWT (含重試)
    if (!authSuccess) {
      console.log('🔄 Main token generation failed, attempting fallback JWT...')
      
      for (let attempt = 1; attempt <= MAX_RETRIES && !authSuccess; attempt++) {
        try {
          const { generateJWT, setAuthCookie } = await import('@/lib/auth')
          console.log(`🔄 Fallback JWT generation attempt ${attempt}/${MAX_RETRIES}`)
          const simpleToken = await generateJWT(userForJWT)
          setAuthCookie(simpleToken)
          console.log(`✅ Fallback JWT authentication successful on attempt ${attempt}`)
          authSuccess = true
          break
        } catch (fallbackError) {
          lastError = fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError))
          console.error(`❌ Fallback JWT attempt ${attempt} failed:`, {
            error: lastError.message,
            userId: user.id,
            userEmail: user.email,
            attempt: attempt
          })
          
          if (attempt < MAX_RETRIES) {
            console.log(`⏳ Waiting ${RETRY_DELAY}ms before fallback retry...`)
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
          }
        }
      }
    }
    
    // 如果所有方法都失敗
    if (!authSuccess) {
      console.error('💥 Complete authentication failure - all retries exhausted:', {
        lastError: lastError?.message || 'Unknown error',
        userId: user.id,
        userEmail: user.email,
        maxRetries: MAX_RETRIES,
        stack: lastError?.stack
      })
      
      // 提供更詳細的錯誤資訊
      const errorDetail = lastError ? 
        `token_generation_failed_after_retries: ${lastError.message.substring(0, 50)}` :
        'token_generation_failed_unknown'
      
      return NextResponse.redirect(new URL(`/login?error=authentication_failed&detail=${encodeURIComponent(errorDetail)}`, baseUrl))
    }

    // Determine redirect URL - 所有已認證用戶都可進入 admin
    let redirectUrl = '/admin' // 預設重定向到 admin
    
    // 所有用戶（包括新用戶和 viewer 角色）都直接重定向到 admin
    // Admin 頁面內部會根據角色控制功能權限
    
    // Check for explicit redirect URL from login
    const oauthRedirect = cookieStore.get('oauth-redirect')?.value
    if (oauthRedirect) {
      redirectUrl = oauthRedirect
    }
    
    // Clear OAuth-related cookies
    const response = NextResponse.redirect(new URL(redirectUrl, baseUrl))
    
    response.cookies.delete('oauth-state')
    response.cookies.delete('oauth-redirect')

    return response

  } catch (error) {
    // 📊 Enhanced Error Logging for Production Debugging
    const errorDetails = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      baseUrl: getBaseUrl(),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      requestUrl: request.url,
      userAgent: request.headers.get('user-agent'),
      // Environment validation
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    }

    console.error('🚨 [PRODUCTION] Google OAuth Callback Critical Error:', errorDetails)
    
    // Log specific error patterns for common issues
    if (error instanceof Error) {
      if (error.message.includes('JWT_SECRET')) {
        console.error('🔐 JWT Secret Error - Check environment variables')
      } else if (error.message.includes('database') || error.message.includes('prisma')) {
        console.error('🗄️ Database Connection Error - Check DATABASE_URL')
      } else if (error.message.includes('google') || error.message.includes('oauth')) {
        console.error('🔍 Google OAuth Error - Check Google credentials and Console setup')
      } else if (error.message.includes('token')) {
        console.error('🎫 Token Generation Error - Check JWT configuration')
      }
    }
    
    // Use baseUrl to avoid localhost:8080 redirect issue
    const baseUrl = getBaseUrl()
    
    // Enhanced error parameter for debugging
    const errorParam = error instanceof Error ? 
      `oauth_callback_failed&detail=${encodeURIComponent(error.message.substring(0, 100))}` : 
      'oauth_callback_failed&detail=unknown_error'
    
    console.error(`🔄 Redirecting to: ${baseUrl}/login?error=${errorParam}`)
    return NextResponse.redirect(new URL(`/login?error=${errorParam}`, baseUrl))
  }
}