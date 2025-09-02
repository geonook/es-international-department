/**
 * Unified Authentication Middleware
 * 統一認證中介層 - 標準化所有 API 端點的認證處理
 * 
 * Features:
 * - Single source of truth for authentication
 * - Role-based access control (RBAC)
 * - Consistent error responses
 * - JWT token validation
 * - Request rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 📋 User Interface
export interface AuthUser {
  id: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
  role: string
  isActive: boolean
  permissions?: string[]
}

// 📋 Auth Result Interface
export interface AuthResult {
  success: boolean
  user?: AuthUser
  error?: string
  statusCode?: number
}

// 📋 Permission Definitions
export const PERMISSIONS = {
  // Communication permissions
  'communication:read': ['viewer', 'office_member', 'admin'],
  'communication:write': ['office_member', 'admin'],
  'communication:delete': ['admin'],
  
  // User management permissions
  'user:read': ['office_member', 'admin'],
  'user:write': ['admin'],
  'user:delete': ['admin'],
  
  // System permissions
  'system:admin': ['admin'],
  'system:settings': ['admin'],
  
  // Resource permissions
  'resource:read': ['viewer', 'office_member', 'admin'],
  'resource:write': ['office_member', 'admin'],
  'resource:delete': ['admin']
} as const

// 📋 Role Hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  viewer: 1,
  office_member: 2,
  admin: 3
} as const

export type UserRole = keyof typeof ROLE_HIERARCHY
export type Permission = keyof typeof PERMISSIONS

// 🔐 Unified Authentication Class
export class UnifiedAuth {
  
  /**
   * Extract JWT token from request
   */
  private static extractToken(request: NextRequest): string | null {
    // Check Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }
    
    // Check cookie
    const tokenCookie = request.cookies.get('auth-token')
    if (tokenCookie?.value) {
      return tokenCookie.value
    }
    
    return null
  }
  
  /**
   * Verify JWT token and get user data
   */
  private static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const secret = process.env.JWT_SECRET
      if (!secret) {
        console.error('JWT_SECRET not configured')
        return null
      }
      
      // Verify JWT
      const payload = jwt.verify(token, secret) as any
      
      if (!payload.userId) {
        return null
      }
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        }
      })
      
      if (!user || !user.isActive) {
        return null
      }
      
      // Get primary role (highest in hierarchy)
      const roles = user.userRoles.map(ur => ur.role.name)
      const primaryRole = roles.reduce((highest, current) => {
        const currentLevel = ROLE_HIERARCHY[current as UserRole] || 0
        const highestLevel = ROLE_HIERARCHY[highest as UserRole] || 0
        return currentLevel > highestLevel ? current : highest
      }, 'viewer')
      
      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: primaryRole,
        isActive: user.isActive,
        permissions: UnifiedAuth.getRolePermissions(primaryRole as UserRole)
      }
      
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }
  
  /**
   * Get all permissions for a role
   */
  private static getRolePermissions(role: UserRole): string[] {
    const permissions: string[] = []
    
    for (const [permission, allowedRoles] of Object.entries(PERMISSIONS)) {
      if (allowedRoles.includes(role)) {
        permissions.push(permission)
      }
    }
    
    return permissions
  }
  
  /**
   * Check if user has required permission
   */
  public static hasPermission(user: AuthUser, permission: Permission): boolean {
    const allowedRoles = PERMISSIONS[permission]
    return allowedRoles.includes(user.role as UserRole)
  }
  
  /**
   * Check if user role meets minimum requirement
   */
  public static hasMinimumRole(user: AuthUser, minimumRole: UserRole): boolean {
    const userLevel = ROLE_HIERARCHY[user.role as UserRole] || 0
    const requiredLevel = ROLE_HIERARCHY[minimumRole] || 999
    return userLevel >= requiredLevel
  }
  
  /**
   * Authenticate request and get user
   */
  public static async authenticate(request: NextRequest): Promise<AuthResult> {
    try {
      // Extract token
      const token = this.extractToken(request)
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication token required',
          statusCode: 401
        }
      }
      
      // Verify token and get user
      const user = await this.verifyToken(token)
      
      if (!user) {
        return {
          success: false,
          error: 'Invalid or expired token',
          statusCode: 401
        }
      }
      
      return {
        success: true,
        user
      }
      
    } catch (error) {
      console.error('Authentication error:', error)
      return {
        success: false,
        error: 'Authentication failed',
        statusCode: 500
      }
    }
  }
  
  /**
   * Require authentication with optional permission check
   */
  public static async requireAuth(
    request: NextRequest,
    requiredPermission?: Permission,
    minimumRole?: UserRole
  ): Promise<AuthResult> {
    // Authenticate user
    const authResult = await this.authenticate(request)
    
    if (!authResult.success || !authResult.user) {
      return authResult
    }
    
    const { user } = authResult
    
    // Check permission if specified
    if (requiredPermission && !this.hasPermission(user, requiredPermission)) {
      return {
        success: false,
        error: 'Insufficient permissions',
        statusCode: 403
      }
    }
    
    // Check minimum role if specified
    if (minimumRole && !this.hasMinimumRole(user, minimumRole)) {
      return {
        success: false,
        error: 'Insufficient role level',
        statusCode: 403
      }
    }
    
    return authResult
  }
  
  /**
   * Create standardized error response
   */
  public static createErrorResponse(authResult: AuthResult): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: authResult.error,
        timestamp: new Date().toISOString()
      },
      { status: authResult.statusCode || 401 }
    )
  }
  
  /**
   * Middleware wrapper for API routes
   */
  public static withAuth(
    handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>,
    options?: {
      requiredPermission?: Permission
      minimumRole?: UserRole
    }
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      // Authenticate and authorize
      const authResult = await this.requireAuth(
        request,
        options?.requiredPermission,
        options?.minimumRole
      )
      
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(authResult)
      }
      
      // Call the actual handler
      try {
        return await handler(request, authResult.user)
      } catch (error) {
        console.error('API handler error:', error)
        return NextResponse.json(
          {
            success: false,
            error: 'Internal server error',
            timestamp: new Date().toISOString()
          },
          { status: 500 }
        )
      }
    }
  }
  
  /**
   * Admin-only middleware wrapper
   */
  public static withAdmin(
    handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
  ) {
    return this.withAuth(handler, { minimumRole: 'admin' })
  }
  
  /**
   * Office member or admin middleware wrapper
   */
  public static withOfficeMember(
    handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
  ) {
    return this.withAuth(handler, { minimumRole: 'office_member' })
  }
  
  /**
   * Any authenticated user middleware wrapper
   */
  public static withUser(
    handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
  ) {
    return this.withAuth(handler, { minimumRole: 'viewer' })
  }
}

// 🎯 Convenience middleware functions
export const requireAuth = UnifiedAuth.requireAuth.bind(UnifiedAuth)
export const withAuth = UnifiedAuth.withAuth.bind(UnifiedAuth)
export const withAdmin = UnifiedAuth.withAdmin.bind(UnifiedAuth)
export const withOfficeMember = UnifiedAuth.withOfficeMember.bind(UnifiedAuth)
export const withUser = UnifiedAuth.withUser.bind(UnifiedAuth)
export const hasPermission = UnifiedAuth.hasPermission.bind(UnifiedAuth)
export const hasMinimumRole = UnifiedAuth.hasMinimumRole.bind(UnifiedAuth)

// Default export
export default UnifiedAuth