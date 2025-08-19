/**
 * Google OAuth Callback API
 * Google OAuth Callback Handler API
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
 * Handle Google OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for errors
    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(new URL('/login?error=oauth_error', request.url))
    }

    // Check required parameters
    if (!code || !state) {
      return NextResponse.redirect(new URL('/login?error=missing_parameters', request.url))
    }

    // Verify CSRF state parameter
    const cookieStore = cookies()
    const storedState = cookieStore.get('oauth-state')?.value
    
    if (!storedState || storedState !== state) {
      console.error('OAuth state mismatch:', { stored: storedState, received: state })
      return NextResponse.redirect(new URL('/login?error=state_mismatch', request.url))
    }

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code)
    
    if (!tokens.idToken) {
      return NextResponse.redirect(new URL('/login?error=no_id_token', request.url))
    }

    // Verify ID Token and get user info
    const googleUser = await verifyGoogleToken(tokens.idToken)
    
    if (!googleUser || !googleUser.email || !googleUser.verified_email) {
      return NextResponse.redirect(new URL('/login?error=invalid_user_info', request.url))
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
        // Create user with pending approval status
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
            isActive: false, // 新用戶預設為待審核狀態
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

        // 不自動分配角色，等待管理員審核
        // 新用戶需要管理員手動分配角色

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
      return NextResponse.redirect(new URL('/login?error=user_creation_failed', request.url))
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

    // Generate JWT token pair
    const tokenPair = await generateTokenPair(userForJWT)
    setAuthCookies(tokenPair)

    // Determine redirect URL based on user status and role
    let redirectUrl = '/admin' // Default to admin
    
    if (isNewUser || !user.isActive) {
      // 新用戶或未啟用用戶重定向到待審核頁面
      redirectUrl = '/pending-approval'
    } else {
      // Redirect based on user role
      const userRoles = user.userRoles.map(ur => ur.role.name)
      if (userRoles.includes('admin')) {
        redirectUrl = '/admin'
      } else if (userRoles.includes('office_member') || userRoles.includes('teacher')) {
        // Office members and teachers (backward compatibility) can access admin
        redirectUrl = '/admin'
      } else {
        // Fallback to admin if no recognized role
        redirectUrl = '/admin'
      }
      
      // Check for explicit redirect URL from login
      const oauthRedirect = cookieStore.get('oauth-redirect')?.value
      if (oauthRedirect) {
        redirectUrl = oauthRedirect
      }
    }
    
    // Clear OAuth-related cookies
    const response = NextResponse.redirect(new URL(redirectUrl, request.url))
    
    response.cookies.delete('oauth-state')
    response.cookies.delete('oauth-redirect')

    return response

  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(new URL('/login?error=oauth_callback_failed', request.url))
  }
}