/**
 * Test Helper Utilities
 * 測試工具函式庫
 */

import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/lib/auth'
import { generateJWT } from '@/lib/auth'

// Mock user data for testing
export const mockUsers = {
  admin: {
    id: 'admin-user-id',
    email: 'admin@kcislk.com',
    firstName: 'Admin',
    lastName: 'User',
    displayName: 'Admin User',
    roles: ['admin']
  } as User,
  
  officeMember: {
    id: 'office-member-id',
    email: 'office@kcislk.com',
    firstName: 'Office',
    lastName: 'Member',
    displayName: 'Office Member',
    roles: ['office_member']
  } as User,
  
  viewer: {
    id: 'viewer-user-id',
    email: 'viewer@kcislk.com',
    firstName: 'Viewer',
    lastName: 'User',
    displayName: 'Viewer User',
    roles: ['viewer']
  } as User,
  
  noRoles: {
    id: 'no-roles-user-id',
    email: 'noroles@kcislk.com',
    firstName: 'No',
    lastName: 'Roles',
    displayName: 'No Roles User',
    roles: []
  } as User
}

// Mock API responses
export const mockAPIResponses = {
  success: (data?: any) => ({
    success: true,
    data: data || null,
    message: 'Operation completed successfully'
  }),
  
  error: (message: string, status: number = 400) => ({
    success: false,
    error: message,
    status
  }),
  
  unauthorized: () => ({
    success: false,
    error: 'Unauthorized access',
    status: 401
  }),
  
  forbidden: () => ({
    success: false,
    error: 'Insufficient permissions',
    status: 403
  }),
  
  notFound: (resource: string = 'Resource') => ({
    success: false,
    error: `${resource} not found`,
    status: 404
  })
}

// Mock database entities
export const mockEntities = {
  announcement: {
    id: 1,
    title: 'Test Announcement',
    content: '<p>This is a test announcement</p>',
    summary: 'Test announcement summary',
    authorId: mockUsers.admin.id,
    targetAudience: 'all',
    priority: 'medium',
    status: 'published',
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  event: {
    id: 1,
    title: 'Test Event',
    description: 'This is a test event',
    eventType: 'meeting',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-01'),
    startTime: new Date('2024-12-01T10:00:00'),
    endTime: new Date('2024-12-01T12:00:00'),
    location: 'Conference Room A',
    maxParticipants: 50,
    registrationRequired: true,
    registrationDeadline: new Date('2024-11-30'),
    targetGrades: ['K1', 'K2', 'G1'],
    targetAudience: ['teachers', 'parents'],
    createdBy: mockUsers.admin.id,
    status: 'published',
    createdAt: new Date(),
    updatedAt: new Date(),
    isFeatured: false
  },
  
  resource: {
    id: 1,
    title: 'Test Resource',
    description: 'This is a test resource',
    resourceType: 'document',
    fileUrl: 'https://example.com/test-resource.pdf',
    thumbnailUrl: 'https://example.com/test-thumbnail.jpg',
    fileSize: BigInt(1024000),
    duration: null,
    gradeLevelId: 1,
    categoryId: 1,
    createdBy: mockUsers.admin.id,
    downloadCount: 0,
    viewCount: 0,
    isFeatured: false,
    status: 'published',
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

// Test authentication helpers
export class TestAuthHelpers {
  /**
   * Generate a test JWT token for a user
   */
  static async generateTestToken(user: User): Promise<string> {
    try {
      return await generateJWT(user)
    } catch (error) {
      console.error('Failed to generate test token:', error)
      throw new Error('Test token generation failed')
    }
  }
  
  /**
   * Create authenticated request headers
   */
  static async createAuthHeaders(user: User): Promise<Record<string, string>> {
    const token = await this.generateTestToken(user)
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Cookie': `auth-token=${token}`
    }
  }
  
  /**
   * Create a mock NextRequest with authentication
   */
  static async createAuthenticatedRequest(
    url: string, 
    method: string = 'GET', 
    user: User = mockUsers.viewer,
    body?: any
  ): Promise<NextRequest> {
    const headers = await this.createAuthHeaders(user)
    
    return new NextRequest(url, {
      method,
      headers: new Headers(headers),
      body: body ? JSON.stringify(body) : undefined,
    })
  }
}

// Database test helpers
export class TestDatabaseHelpers {
  /**
   * Create test data in database
   */
  static async seedTestData() {
    // This would interact with your test database
    // Implementation depends on your testing strategy
    console.log('Seeding test data...')
  }
  
  /**
   * Clean up test data
   */
  static async cleanupTestData() {
    // This would clean up test data from database
    console.log('Cleaning up test data...')
  }
  
  /**
   * Reset database to clean state
   */
  static async resetDatabase() {
    await this.cleanupTestData()
    await this.seedTestData()
  }
}

// API testing helpers
export class TestAPIHelpers {
  /**
   * Mock successful API response
   */
  static mockSuccessResponse(data: any): NextResponse {
    return NextResponse.json(mockAPIResponses.success(data), { status: 200 })
  }
  
  /**
   * Mock error API response
   */
  static mockErrorResponse(message: string, status: number = 400): NextResponse {
    return NextResponse.json(mockAPIResponses.error(message, status), { status })
  }
  
  /**
   * Test API endpoint with authentication
   */
  static async testEndpointWithAuth(
    endpoint: (request: NextRequest) => Promise<NextResponse>,
    url: string,
    method: string = 'GET',
    user: User = mockUsers.viewer,
    body?: any
  ) {
    const request = await TestAuthHelpers.createAuthenticatedRequest(url, method, user, body)
    return await endpoint(request)
  }
}

// Component testing helpers
export class TestComponentHelpers {
  /**
   * Mock component props with authentication
   */
  static createMockPropsWithAuth(user: User, additionalProps: any = {}) {
    return {
      user,
      isAuthenticated: true,
      isLoading: false,
      ...additionalProps
    }
  }
  
  /**
   * Mock useAuth hook
   */
  static mockUseAuth(user: User | null = mockUsers.viewer) {
    return {
      user,
      isLoading: false,
      isAuthenticated: !!user,
      login: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      checkAuth: jest.fn(),
      redirectToLogin: jest.fn(),
      authenticatedFetch: jest.fn(),
      hasRole: jest.fn((role: string) => user?.roles?.includes(role) || false),
      isAdmin: jest.fn(() => user?.roles?.includes('admin') || false),
      isTeacher: jest.fn(() => user?.roles?.includes('office_member') || false),
      isOfficeMember: jest.fn(() => user?.roles?.includes('office_member') || false),
      isViewer: jest.fn(() => user?.roles?.includes('viewer') || false),
    }
  }
}

// Validation helpers
export class TestValidationHelpers {
  /**
   * Validate JWT token format
   */
  static isValidJWT(token: string): boolean {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
    return jwtRegex.test(token)
  }
  
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  /**
   * Validate API response structure
   */
  static validateAPIResponse(response: any, shouldSucceed: boolean = true): boolean {
    if (shouldSucceed) {
      return response.success === true && response.data !== undefined
    } else {
      return response.success === false && response.error !== undefined
    }
  }
}

// Performance testing helpers
export class TestPerformanceHelpers {
  /**
   * Measure function execution time
   */
  static async measureExecutionTime<T>(
    fn: () => Promise<T> | T,
    label: string = 'Function'
  ): Promise<{ result: T; executionTime: number }> {
    const startTime = performance.now()
    const result = await fn()
    const endTime = performance.now()
    const executionTime = endTime - startTime
    
    console.log(`${label} execution time: ${executionTime.toFixed(2)}ms`)
    
    return { result, executionTime }
  }
  
  /**
   * Test function performance and assert it meets threshold
   */
  static async assertPerformance<T>(
    fn: () => Promise<T> | T,
    maxExecutionTime: number,
    label: string = 'Function'
  ): Promise<T> {
    const { result, executionTime } = await this.measureExecutionTime(fn, label)
    
    if (executionTime > maxExecutionTime) {
      throw new Error(`${label} took ${executionTime.toFixed(2)}ms, which exceeds threshold of ${maxExecutionTime}ms`)
    }
    
    return result
  }
}

// Export all helpers
export {
  TestAuthHelpers,
  TestDatabaseHelpers,
  TestAPIHelpers,
  TestComponentHelpers,
  TestValidationHelpers,
  TestPerformanceHelpers
}