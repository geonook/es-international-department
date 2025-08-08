/**
 * Google OAuth Configuration and Utilities
 * Google OAuth 配置與工具函式
 */

import { OAuth2Client } from 'google-auth-library'
import { env } from './env-validation'

// Google OAuth 設定 - 使用類型安全的環境變數
export const GOOGLE_OAUTH_CONFIG = {
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.NEXTAUTH_URL ? 
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google` : 
    'http://localhost:3000/api/auth/callback/google',
  scopes: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ]
}

// 初始化 OAuth2 客戶端
export function createGoogleOAuthClient(): OAuth2Client {
  return new OAuth2Client(
    GOOGLE_OAUTH_CONFIG.clientId,
    GOOGLE_OAUTH_CONFIG.clientSecret,
    GOOGLE_OAUTH_CONFIG.redirectUri
  )
}

// Google 用戶資訊介面
export interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
}

/**
 * 生成 Google OAuth 授權 URL
 */
export function generateGoogleAuthUrl(state?: string): string {
  const oauth2Client = createGoogleOAuthClient()
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_OAUTH_CONFIG.scopes,
    state: state || crypto.randomUUID(),
    prompt: 'consent' // 強制顯示同意畫面
  })
}

/**
 * 使用授權碼交換訪問令牌
 */
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = createGoogleOAuthClient()
  
  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token,
      expiryDate: tokens.expiry_date
    }
  } catch (error) {
    console.error('Error exchanging code for tokens:', error)
    throw new Error('Failed to exchange authorization code')
  }
}

/**
 * 驗證 Google ID Token 並獲取用戶資訊
 */
export async function verifyGoogleToken(idToken: string): Promise<GoogleUserInfo | null> {
  const oauth2Client = createGoogleOAuthClient()
  
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: GOOGLE_OAUTH_CONFIG.clientId,
    })
    
    const payload = ticket.getPayload()
    
    if (!payload) {
      return null
    }
    
    return {
      id: payload.sub!,
      email: payload.email!,
      verified_email: payload.email_verified || false,
      name: payload.name || '',
      given_name: payload.given_name || '',
      family_name: payload.family_name || '',
      picture: payload.picture || '',
      locale: payload.locale || 'en'
    }
  } catch (error) {
    console.error('Error verifying Google token:', error)
    return null
  }
}

/**
 * 使用訪問令牌獲取用戶資訊
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo | null> {
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info')
    }
    
    const userInfo = await response.json()
    return userInfo as GoogleUserInfo
  } catch (error) {
    console.error('Error fetching Google user info:', error)
    return null
  }
}

/**
 * 根據 email 域名分配角色
 */
export function assignRoleByEmailDomain(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase()
  
  // 角色分配邏輯
  const roleMapping: Record<string, string> = {
    // 教育機構域名 -> 教師角色
    'school.edu': 'teacher',
    'university.edu': 'teacher',
    
    // 常見家長 email 域名 -> 家長角色
    'gmail.com': 'parent',
    'yahoo.com': 'parent',
    'hotmail.com': 'parent',
    'outlook.com': 'parent',
    
    // 可以根據實際需求添加更多映射
  }
  
  return roleMapping[domain] || 'parent' // 預設為家長角色
}

/**
 * 驗證環境變數設定
 */
export function validateGoogleOAuthConfig(): boolean {
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ]
  
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('Missing Google OAuth environment variables:', missingVars)
    return false
  }
  
  return true
}

/**
 * 生成安全的狀態參數 (防 CSRF)
 */
export function generateSecureState(): string {
  return crypto.randomUUID()
}

/**
 * 撤銷 Google 訪問令牌
 */
export async function revokeGoogleToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    
    return response.ok
  } catch (error) {
    console.error('Error revoking Google token:', error)
    return false
  }
}