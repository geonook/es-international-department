/**
 * Google OAuth Configuration and Utilities
 * Google OAuth Configuration and Utilities
 */

import { OAuth2Client } from 'google-auth-library'
import { env } from './env-validation'

// Google OAuth settings - using type-safe environment variables
export const GOOGLE_OAUTH_CONFIG = {
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.NEXTAUTH_URL ? 
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google` : 
    'http://localhost:3001/api/auth/callback/google',
  scopes: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ]
}

// Initialize OAuth2 client
export function createGoogleOAuthClient(): OAuth2Client {
  return new OAuth2Client(
    GOOGLE_OAUTH_CONFIG.clientId,
    GOOGLE_OAUTH_CONFIG.clientSecret,
    GOOGLE_OAUTH_CONFIG.redirectUri
  )
}

// Google user info interface
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
 * Generate Google OAuth authorization URL
 */
export function generateGoogleAuthUrl(state?: string): string {
  const oauth2Client = createGoogleOAuthClient()
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_OAUTH_CONFIG.scopes,
    state: state || crypto.randomUUID(),
    prompt: 'consent' // Force display consent screen
  })
}

/**
 * Exchange authorization code for access tokens
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
 * Verify Google ID Token and get user info
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
 * Get user info using access token
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
 * Assign roles based on email domain
 */
export function assignRoleByEmailDomain(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase()
  
  // Role assignment logic
  const roleMapping: Record<string, string> = {
    // Educational institution domains -> teacher role
    'school.edu': 'teacher',
    'university.edu': 'teacher',
    
    // Common parent email domains -> parent role
    'gmail.com': 'parent',
    'yahoo.com': 'parent',
    'hotmail.com': 'parent',
    'outlook.com': 'parent',
    
    // Can add more mappings based on actual needs
  }
  
  return roleMapping[domain] || 'parent' // Default to parent role
}

/**
 * Validate environment variable configuration
 */
export function validateGoogleOAuthConfig(): boolean {
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ]
  
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('❌ Missing Google OAuth environment variables:', missingVars)
    return false
  }
  
  // Enhanced validation with detailed logging
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  
  console.log('🔍 Google OAuth Configuration Validation:')
  console.log('  - Client ID:', clientId ? `${clientId.substring(0, 20)}...` : 'MISSING')
  console.log('  - Client Secret:', clientSecret ? `${clientSecret.substring(0, 10)}...` : 'MISSING')
  console.log('  - Redirect URI:', GOOGLE_OAUTH_CONFIG.redirectUri)
  console.log('  - NextAuth URL:', process.env.NEXTAUTH_URL)
  
  // Validate Client ID format
  if (clientId && !clientId.endsWith('.apps.googleusercontent.com')) {
    console.error('❌ Invalid Google Client ID format')
    return false
  }
  
  // Validate Client Secret format (Google secrets start with GOCSPX-)
  if (clientSecret && !clientSecret.startsWith('GOCSPX-')) {
    console.error('❌ Invalid Google Client Secret format')
    return false
  }
  
  console.log('✅ Google OAuth configuration validation passed')
  return true
}

/**
 * Generate secure state parameter (CSRF protection)
 */
export function generateSecureState(): string {
  return crypto.randomUUID()
}

/**
 * Revoke Google access token
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