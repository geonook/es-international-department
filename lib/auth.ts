/**
 * Authentication Utilities for KCISLK ESID Info Hub
 * JWT Token Management and Password Authentication Utilities
 */

import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { env } from './env-validation'

// JWT settings - using type-safe environment variables
const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET)
const JWT_ALGORITHM = 'HS256'
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN || '7d'

// User interface definitions
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  roles: string[]
}

export interface JWTPayload {
  userId: string
  email: string
  roles: string[]
  iat: number
  exp: number
}

/**
 * Generate JWT Token
 */
export async function generateJWT(user: User): Promise<string> {
  try {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
    }

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: JWT_ALGORITHM })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(JWT_SECRET)

    return token
  } catch (error) {
    console.error('Error generating JWT:', error)
    throw new Error('Failed to generate authentication token')
  }
}

/**
 * Verify JWT Token
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    })

    return payload as JWTPayload
  } catch (error) {
    console.error('Error verifying JWT:', error)
    return null
  }
}

/**
 * Get JWT Token from request
 */
export function getTokenFromRequest(): string | null {
  try {
    const cookieStore = cookies()
    const authCookie = cookieStore.get('auth-token')
    
    if (authCookie) {
      return authCookie.value
    }

    return null
  } catch (error) {
    console.error('Error getting token from request:', error)
    return null
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = getTokenFromRequest()
    if (!token) {
      return null
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return null
    }

    // Can get complete user info from database here
    // Currently return basic info from JWT
    return {
      id: payload.userId,
      email: payload.email,
      roles: payload.roles,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Password hash processing
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  } catch (error) {
    console.error('Error hashing password:', error)
    throw new Error('Failed to process password')
  }
}

/**
 * Password verification
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, role: string): boolean {
  if (!user || !user.roles) {
    return false
  }
  return user.roles.includes(role)
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin')
}

/**
 * Check if user is office member
 */
export function isOfficeMember(user: User | null): boolean {
  return hasRole(user, 'office_member')
}

/**
 * Check if user is teacher (backward compatibility - now checks office_member)
 */
export function isTeacher(user: User | null): boolean {
  return hasRole(user, 'office_member') || hasRole(user, 'teacher')
}

/**
 * Set authentication cookie (legacy function - prefer setAuthCookies for token pairs)
 */
export function setAuthCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 4 * 60 * 60, // 4 hours (consistent with ACCESS_TOKEN_EXPIRES_IN)
    path: '/',
  })
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie() {
  const cookieStore = cookies()
  cookieStore.delete('auth-token')
}

/**
 * Verify authentication status of API requests
 */
export async function verifyAuth(request?: Request): Promise<{ user: User | null, authenticated: boolean }> {
  try {
    const user = await getCurrentUser()
    return {
      user,
      authenticated: user !== null
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return {
      user: null,
      authenticated: false
    }
  }
}

/**
 * API authentication error responses
 */
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid username or password',
  TOKEN_EXPIRED: 'Authentication token has expired',
  ACCESS_DENIED: 'Access denied - insufficient permissions',
  TOKEN_REQUIRED: 'Authentication token required',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
} as const

// Token expiry settings - optimized for better user experience
const REFRESH_TOKEN_EXPIRES_IN = '30d' // 30 days expiry
const ACCESS_TOKEN_EXPIRES_IN = '4h' // 4 hours expiry (extended from 15m to reduce login frequency)

export interface RefreshTokenPayload {
  userId: string
  tokenId: string
  iat: number
  exp: number
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

/**
 * Generate access token (short-lived)
 */
export async function generateAccessToken(user: User): Promise<string> {
  try {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
    }

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: JWT_ALGORITHM })
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
      .sign(JWT_SECRET)

    return token
  } catch (error) {
    console.error('Error generating access token:', error)
    throw new Error('Failed to generate access token')
  }
}

/**
 * Generate refresh token (long-lived)
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  try {
    const tokenId = crypto.randomUUID()
    const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
      userId,
      tokenId,
    }

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: JWT_ALGORITHM })
      .setIssuedAt()
      .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
      .sign(JWT_SECRET)

    // Store refresh token to database
    await storeRefreshToken(userId, tokenId, token)

    return token
  } catch (error) {
    console.error('Error generating refresh token:', error)
    throw new Error('Failed to generate refresh token')
  }
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    })

    const refreshPayload = payload as RefreshTokenPayload

    // Check if token exists in database and is valid
    const isValid = await validateRefreshToken(refreshPayload.userId, refreshPayload.tokenId)
    if (!isValid) {
      return null
    }

    return refreshPayload
  } catch (error) {
    console.error('Error verifying refresh token:', error)
    return null
  }
}

/**
 * Generate token pair (Access + Refresh)
 */
export async function generateTokenPair(user: User): Promise<TokenPair> {
  console.log(`Generating token pair for user: ${user.email} (${user.id})`)
  
  try {
    // Generate access token first (this is more likely to succeed)
    const accessToken = await generateAccessToken(user)
    console.log('✅ Access token generated successfully')
    
    // Then generate refresh token with enhanced error handling
    let refreshToken: string
    try {
      refreshToken = await generateRefreshToken(user.id)
      console.log('✅ Refresh token generated successfully')
    } catch (refreshError) {
      console.error('❌ Refresh token generation failed, using fallback approach:', refreshError)
      
      // Fallback: generate a simple access token with longer expiration
      const fallbackToken = await new SignJWT({
        userId: user.id,
        email: user.email,
        roles: user.roles,
        fallback: true
      })
        .setProtectedHeader({ alg: JWT_ALGORITHM })
        .setIssuedAt()
        .setExpirationTime('24h') // Longer expiration for fallback
        .sign(JWT_SECRET)
      
      console.log('✅ Fallback token generated (24h expiration)')
      refreshToken = fallbackToken
    }

    const tokenPair = {
      accessToken,
      refreshToken
    }
    
    console.log('🎉 Token pair generation completed successfully')
    return tokenPair
    
  } catch (error) {
    console.error('💥 Complete token generation failure:', {
      userId: user.id,
      email: user.email,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // Last resort: throw detailed error for fallback mechanism in OAuth callback
    throw new Error(`Complete token generation failed for user ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
  try {
    const refreshPayload = await verifyRefreshToken(refreshToken)
    if (!refreshPayload) {
      return null
    }

    // Get user information from database
    const user = await getUserById(refreshPayload.userId)
    if (!user) {
      return null
    }

    // Generate new token pair
    const newTokenPair = await generateTokenPair(user)

    // Invalidate old refresh token
    await revokeRefreshToken(refreshPayload.userId, refreshPayload.tokenId)

    return newTokenPair
  } catch (error) {
    console.error('Error refreshing access token:', error)
    return null
  }
}

/**
 * Set authentication cookies (Access + Refresh)
 */
export function setAuthCookies(tokenPair: TokenPair) {
  const cookieStore = cookies()
  
  // Access Token (extended for better UX)
  cookieStore.set('auth-token', tokenPair.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 4 * 60 * 60, // 4 hours (matches ACCESS_TOKEN_EXPIRES_IN)
    path: '/',
  })

  // Refresh Token (long-lived)
  cookieStore.set('refresh-token', tokenPair.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies() {
  const cookieStore = cookies()
  cookieStore.delete('auth-token')
  cookieStore.delete('refresh-token')
}

/**
 * Get refresh token
 */
export function getRefreshTokenFromRequest(): string | null {
  try {
    const cookieStore = cookies()
    const refreshCookie = cookieStore.get('refresh-token')
    
    return refreshCookie?.value || null
  } catch (error) {
    console.error('Error getting refresh token from request:', error)
    return null
  }
}

// Database operation functions (implementation required)
async function storeRefreshToken(userId: string, tokenId: string, token: string): Promise<void> {
  const MAX_RETRIES = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { prisma } = await import('@/lib/prisma')
      
      console.log(`[Attempt ${attempt}/${MAX_RETRIES}] Storing refresh token for user ${userId}`)
      
      // First, verify the user exists to avoid foreign key constraint errors
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, isActive: true }
      })
      
      if (!userExists) {
        const error = new Error(`User ${userId} not found when storing refresh token`)
        console.error(error.message)
        throw error // Don't retry if user doesn't exist
      }
      
      console.log(`User validation successful: ${userExists.email} (active: ${userExists.isActive})`)
      
      // Check for existing sessions with same token to prevent duplicates
      const existingSession = await prisma.userSession.findUnique({
        where: { sessionToken: tokenId },
        select: { id: true, userId: true }
      })
      
      if (existingSession) {
        if (existingSession.userId === userId) {
          console.log(`Session token already exists for same user, updating expiration`)
          await prisma.userSession.update({
            where: { sessionToken: tokenId },
            data: {
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              userAgent: 'refresh-token-updated',
              ipAddress: '0.0.0.0'
            }
          })
          console.log(`Successfully updated existing refresh token for user ${userId}`)
          return
        } else {
          console.log(`Session token exists for different user, generating new token`)
          tokenId = crypto.randomUUID() // Generate new unique token
        }
      }
      
      // Create the session record with enhanced error handling
      const newSession = await prisma.userSession.create({
        data: {
          userId,
          sessionToken: tokenId,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          userAgent: 'refresh-token',
          ipAddress: '0.0.0.0'
        }
      })
      
      console.log(`Successfully stored refresh token: sessionId=${newSession.id}, userId=${userId}`)
      return // Success, exit retry loop
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      console.error(`[Attempt ${attempt}/${MAX_RETRIES}] Error storing refresh token:`, {
        userId,
        tokenId,
        attempt,
        error: lastError.message,
        stack: lastError.stack
      })
      
      // Check if it's a retryable error
      const isRetryable = lastError.message.includes('timeout') || 
                         lastError.message.includes('connection') ||
                         lastError.message.includes('ECONNRESET') ||
                         lastError.message.includes('ENOTFOUND')
      
      if (!isRetryable || attempt === MAX_RETRIES) {
        break // Don't retry for non-retryable errors or on last attempt
      }
      
      // Wait before retry with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
      console.log(`Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // If we reach here, all retries failed
  throw new Error(`Failed to store refresh token after ${MAX_RETRIES} attempts: ${lastError?.message || 'Unknown error'}`)
}

async function validateRefreshToken(userId: string, tokenId: string): Promise<boolean> {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    // Optimized query: Check existence with specific conditions in single query
    const session = await prisma.userSession.findFirst({
      where: {
        sessionToken: tokenId,
        userId: userId,
        expiresAt: {
          gt: new Date()
        }
      },
      select: { id: true } // Only select minimal data needed
    })

    return !!session
  } catch (error) {
    console.error('Error validating refresh token:', error)
    return false
  }
}

async function revokeRefreshToken(userId: string, tokenId: string): Promise<void> {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    await prisma.userSession.delete({
      where: { sessionToken: tokenId }
    })
  } catch (error) {
    console.error('Error revoking refresh token:', error)
  }
}

async function getUserById(userId: string): Promise<User | null> {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    // Optimized query: Use select to minimize data transfer and include for efficiency
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      displayName: user.displayName || undefined,
      roles: user.userRoles.map(ur => ur.role.name)
    }
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
}