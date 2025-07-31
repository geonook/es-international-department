/**
 * Authentication Utilities for ES International Department
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
} as const