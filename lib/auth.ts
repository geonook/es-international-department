/**
 * Authentication Utilities for KCISLK ESID Info Hub
 * JWT Token 管理和密碼認證工具函式
 */

import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

// JWT 設定
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const JWT_ALGORITHM = 'HS256'
const JWT_EXPIRES_IN = '7d' // 7 天過期

// 使用者介面定義
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
 * 生成 JWT Token
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
 * 驗證 JWT Token
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
 * 從請求中獲取 JWT Token
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
 * 獲取當前認證使用者
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

    // 這裡可以從資料庫獲取完整使用者資訊
    // 目前先返回 JWT 中的基本資訊
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
 * 密碼 Hash 處理
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
 * 密碼驗證
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
 * 檢查使用者是否有特定角色
 */
export function hasRole(user: User | null, role: string): boolean {
  if (!user || !user.roles) {
    return false
  }
  return user.roles.includes(role)
}

/**
 * 檢查使用者是否為管理員
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin')
}

/**
 * 檢查使用者是否為教師
 */
export function isTeacher(user: User | null): boolean {
  return hasRole(user, 'teacher')
}

/**
 * 設定認證 Cookie
 */
export function setAuthCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 天
    path: '/',
  })
}

/**
 * 清除認證 Cookie
 */
export function clearAuthCookie() {
  const cookieStore = cookies()
  cookieStore.delete('auth-token')
}

/**
 * API 認證錯誤回應
 */
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid username or password',
  TOKEN_EXPIRED: 'Authentication token has expired',
  ACCESS_DENIED: 'Access denied - insufficient permissions',
  TOKEN_REQUIRED: 'Authentication token required',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
} as const

// Refresh Token 設定
const REFRESH_TOKEN_EXPIRES_IN = '30d' // 30 天過期
const ACCESS_TOKEN_EXPIRES_IN = '15m' // 15 分鐘過期

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
 * 生成存取 Token (短時效)
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
 * 生成刷新 Token (長時效)
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

    // 將 refresh token 存儲到資料庫
    await storeRefreshToken(userId, tokenId, token)

    return token
  } catch (error) {
    console.error('Error generating refresh token:', error)
    throw new Error('Failed to generate refresh token')
  }
}

/**
 * 驗證刷新 Token
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    })

    const refreshPayload = payload as RefreshTokenPayload

    // 檢查 token 是否在資料庫中存在且有效
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
 * 生成 Token 配對 (Access + Refresh)
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
 * 刷新存取 Token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
  try {
    const refreshPayload = await verifyRefreshToken(refreshToken)
    if (!refreshPayload) {
      return null
    }

    // 從資料庫獲取使用者資訊
    const user = await getUserById(refreshPayload.userId)
    if (!user) {
      return null
    }

    // 生成新的 token 配對
    const newTokenPair = await generateTokenPair(user)

    // 使舊的 refresh token 失效
    await revokeRefreshToken(refreshPayload.userId, refreshPayload.tokenId)

    return newTokenPair
  } catch (error) {
    console.error('Error refreshing access token:', error)
    return null
  }
}

/**
 * 設定認證 Cookies (Access + Refresh)
 */
export function setAuthCookies(tokenPair: TokenPair) {
  const cookieStore = cookies()
  
  // Access Token (短時效)
  cookieStore.set('auth-token', tokenPair.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 分鐘
    path: '/',
  })

  // Refresh Token (長時效)
  cookieStore.set('refresh-token', tokenPair.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 天
    path: '/',
  })
}

/**
 * 清除認證 Cookies
 */
export function clearAuthCookies() {
  const cookieStore = cookies()
  cookieStore.delete('auth-token')
  cookieStore.delete('refresh-token')
}

/**
 * 獲取 Refresh Token
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

// 資料庫操作函式 (需要實現)
async function storeRefreshToken(userId: string, tokenId: string, token: string): Promise<void> {
  // 這裡需要實現資料庫存儲邏輯
  // 可以存儲在 UserSession 表中
  try {
    const { prisma } = await import('@/lib/prisma')
    
    await prisma.userSession.create({
      data: {
        userId,
        sessionToken: tokenId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 天
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