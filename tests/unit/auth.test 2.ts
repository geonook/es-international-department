/**
 * Authentication Unit Tests
 * 認證系統單元測試
 */

import { 
  generateJWT, 
  verifyJWT, 
  hashPassword, 
  verifyPassword,
  hasRole,
  isAdmin,
  isOfficeMember
} from '@/lib/auth'
import { 
  mockUsers,
  TestAuthHelpers,
  TestValidationHelpers 
} from '../utils/test-helpers'

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'

describe('Authentication System', () => {
  describe('JWT Token Management', () => {
    test('should generate valid JWT token for user', async () => {
      const user = mockUsers.admin
      const token = await generateJWT(user)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(TestValidationHelpers.isValidJWT(token)).toBe(true)
    })
    
    test('should verify valid JWT token', async () => {
      const user = mockUsers.admin
      const token = await generateJWT(user)
      const payload = await verifyJWT(token)
      
      expect(payload).toBeDefined()
      expect(payload?.userId).toBe(user.id)
      expect(payload?.email).toBe(user.email)
      expect(payload?.roles).toEqual(user.roles)
    })
    
    test('should reject invalid JWT token', async () => {
      const invalidToken = 'invalid.jwt.token'
      const payload = await verifyJWT(invalidToken)
      
      expect(payload).toBeNull()
    })
    
    test('should reject malformed JWT token', async () => {
      const malformedToken = 'not-a-jwt-token-at-all'
      const payload = await verifyJWT(malformedToken)
      
      expect(payload).toBeNull()
    })
    
    test('JWT token should contain required fields', async () => {
      const user = mockUsers.officeMember
      const token = await generateJWT(user)
      const payload = await verifyJWT(token)
      
      expect(payload).toHaveProperty('userId')
      expect(payload).toHaveProperty('email')
      expect(payload).toHaveProperty('roles')
      expect(payload).toHaveProperty('iat')
      expect(payload).toHaveProperty('exp')
      
      // Verify expiration is in the future
      expect(payload!.exp * 1000).toBeGreaterThan(Date.now())
    })
  })
  
  describe('Password Management', () => {
    const testPassword = 'TestPassword123!'
    
    test('should hash password correctly', async () => {
      const hashedPassword = await hashPassword(testPassword)
      
      expect(hashedPassword).toBeDefined()
      expect(typeof hashedPassword).toBe('string')
      expect(hashedPassword).not.toBe(testPassword)
      expect(hashedPassword.length).toBeGreaterThan(50) // bcrypt hashes are typically 60 chars
    })
    
    test('should verify correct password', async () => {
      const hashedPassword = await hashPassword(testPassword)
      const isValid = await verifyPassword(testPassword, hashedPassword)
      
      expect(isValid).toBe(true)
    })
    
    test('should reject incorrect password', async () => {
      const hashedPassword = await hashPassword(testPassword)
      const isValid = await verifyPassword('WrongPassword123!', hashedPassword)
      
      expect(isValid).toBe(false)
    })
    
    test('should handle empty password gracefully', async () => {
      await expect(hashPassword('')).rejects.toThrow()
    })
  })
  
  describe('Role-Based Authorization', () => {
    test('should correctly identify admin role', () => {
      expect(hasRole(mockUsers.admin, 'admin')).toBe(true)
      expect(isAdmin(mockUsers.admin)).toBe(true)
      
      expect(hasRole(mockUsers.officeMember, 'admin')).toBe(false)
      expect(isAdmin(mockUsers.officeMember)).toBe(false)
    })
    
    test('should correctly identify office member role', () => {
      expect(hasRole(mockUsers.officeMember, 'office_member')).toBe(true)
      expect(isOfficeMember(mockUsers.officeMember)).toBe(true)
      
      expect(hasRole(mockUsers.viewer, 'office_member')).toBe(false)
      expect(isOfficeMember(mockUsers.viewer)).toBe(false)
    })
    
    test('should correctly identify viewer role', () => {
      expect(hasRole(mockUsers.viewer, 'viewer')).toBe(true)
      expect(hasRole(mockUsers.admin, 'viewer')).toBe(false)
    })
    
    test('should handle user without roles', () => {
      expect(hasRole(mockUsers.noRoles, 'admin')).toBe(false)
      expect(hasRole(mockUsers.noRoles, 'office_member')).toBe(false)
      expect(hasRole(mockUsers.noRoles, 'viewer')).toBe(false)
      
      expect(isAdmin(mockUsers.noRoles)).toBe(false)
      expect(isOfficeMember(mockUsers.noRoles)).toBe(false)
    })
    
    test('should handle null user gracefully', () => {
      expect(hasRole(null, 'admin')).toBe(false)
      expect(isAdmin(null)).toBe(false)
      expect(isOfficeMember(null)).toBe(false)
    })
  })
  
  describe('Test Helper Functions', () => {
    test('should generate valid test token', async () => {
      const user = mockUsers.viewer
      const token = await TestAuthHelpers.generateTestToken(user)
      
      expect(token).toBeDefined()
      expect(TestValidationHelpers.isValidJWT(token)).toBe(true)
    })
    
    test('should create authentication headers', async () => {
      const user = mockUsers.admin
      const headers = await TestAuthHelpers.createAuthHeaders(user)
      
      expect(headers).toHaveProperty('Authorization')
      expect(headers).toHaveProperty('Content-Type', 'application/json')
      expect(headers).toHaveProperty('Cookie')
      expect(headers.Authorization).toMatch(/^Bearer /)
    })
    
    test('should validate email format correctly', () => {
      expect(TestValidationHelpers.isValidEmail('user@example.com')).toBe(true)
      expect(TestValidationHelpers.isValidEmail('invalid-email')).toBe(false)
      expect(TestValidationHelpers.isValidEmail('user@')).toBe(false)
      expect(TestValidationHelpers.isValidEmail('@example.com')).toBe(false)
    })
  })
})