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
 * Set authentication cookie
 */
export function setAuthCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
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

// Refresh Token settings
const REFRESH_TOKEN_EXPIRES_IN = '30d' // 30 days expiry
const ACCESS_TOKEN_EXPIRES_IN = '15m' // 15 minutes expiry

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
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(user),
    generateRefreshToken(user.id)
  ])

  return {
    accessToken,
    refreshToken
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
  
  // Access Token (short-lived)
  cookieStore.set('auth-token', tokenPair.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
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
  // Database storage logic implementation required here
  // Can store in UserSession table
  try {
    const { prisma } = await import('@/lib/prisma')
    
    await prisma.userSession.create({
      data: {
        userId,
        sessionToken: tokenId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        userAgent: 'refresh-token',
        ipAddress: '0.0.0.0'
      }
    })
  } catch (error) {
    console.error('Error storing refresh token:', error)
    throw error
  }
}

async function validateRefreshToken(userId: string, tokenId: string): Promise<boolean> {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    const session = await prisma.userSession.findUnique({
      where: { sessionToken: tokenId }
    })

    return !!(session && session.userId === userId && session.expiresAt > new Date())
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
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true
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