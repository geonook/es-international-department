/**
 * Authentication Utilities for API Routes
 * Authentication utilities for API routes
 * 
 * @description Optimized authentication check tools to reduce duplicate logic and improve performance
 * @version 1.0.0
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, AUTH_ERRORS, User } from '@/lib/auth'

/**
 * API authentication result interface
 */
export interface AuthResult {
  success: boolean
  user: User | null
  response?: NextResponse
}

/**
 * Quick API authentication check (for API routes requiring authentication)
 * 
 * @description Unified authentication check logic to avoid repetitive code in each API route
 * @param request - Next.js request object (optional, for additional request info)
 * @returns Authentication result and error response (if authentication fails)
 */
export async function requireApiAuth(request?: NextRequest): Promise<AuthResult> {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return {
        success: false,
        user: null,
        response: NextResponse.json(
          { 
            success: false, 
            error: AUTH_ERRORS.TOKEN_REQUIRED,
            message: 'Login required to access this resource' 
          },
          { status: 401 }
        )
      }
    }

    return {
      success: true,
      user,
      response: undefined
    }
  } catch (error) {
    console.error('API Auth check error:', error)
    return {
      success: false,
      user: null,
      response: NextResponse.json(
        { 
          success: false, 
          error: 'AUTH_ERROR',
          message: 'Authentication process error occurred' 
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Admin permission check (for API routes requiring admin permissions)
 * 
 * @description Check if user has admin permissions
 * @param request - Next.js request object (optional)
 * @returns Authentication result and error response (if insufficient permissions)
 */
export async function requireAdminAuth(request?: NextRequest): Promise<AuthResult> {
  const authResult = await requireApiAuth(request)
  
  if (!authResult.success || !authResult.user) {
    return authResult
  }

  const user = authResult.user
  const isAdmin = user.roles.includes('admin')
  
  if (!isAdmin) {
    return {
      success: false,
      user,
      response: NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: 'Admin permissions required to access this resource' 
        },
        { status: 403 }
      )
    }
  }

  return {
    success: true,
    user,
    response: undefined
  }
}

/**
 * Teacher permission check (for API routes requiring teacher permissions)
 * 
 * @description Check if user has teacher or admin permissions
 * @param request - Next.js request object (optional)
 * @returns Authentication result and error response (if insufficient permissions)
 */
export async function requireTeacherAuth(request?: NextRequest): Promise<AuthResult> {
  const authResult = await requireApiAuth(request)
  
  if (!authResult.success || !authResult.user) {
    return authResult
  }

  const user = authResult.user
  const hasTeacherAccess = user.roles.includes('teacher') || user.roles.includes('admin')
  
  if (!hasTeacherAccess) {
    return {
      success: false,
      user,
      response: NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: 'Teacher permissions required to access this resource' 
        },
        { status: 403 }
      )
    }
  }

  return {
    success: true,
    user,
    response: undefined
  }
}

/**
 * API error response generator
 * 
 * @description Unified error response format
 * @param message - Error message
 * @param status - HTTP status code
 * @param error - Error code
 * @returns NextResponse error response
 */
export function createApiErrorResponse(
  message: string, 
  status: number = 500, 
  error: string = 'API_ERROR'
): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      error,
      message 
    },
    { status }
  )
}

/**
 * API success response generator
 * 
 * @description Unified success response format
 * @param data - Response data
 * @param message - Success message (optional)
 * @returns NextResponse success response
 */
export function createApiSuccessResponse(
  data: any, 
  message?: string
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message })
  })
}

/**
 * Safely parse query parameters from request
 * 
 * @description Safely parse URL query parameters, avoiding direct use of request.url
 * @param request - Next.js request object
 * @returns URLSearchParams object
 */
export function getSearchParams(request: NextRequest): URLSearchParams {
  try {
    const { searchParams } = new URL(request.url)
    return searchParams
  } catch (error) {
    console.error('Error parsing search params:', error)
    return new URLSearchParams()
  }
}

/**
 * Pagination parameter parser
 * 
 * @description Parse pagination information from query parameters
 * @param searchParams - URLSearchParams object
 * @returns Pagination information
 */
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Sort parameter parser
 * 
 * @description Parse sort information from query parameters
 * @param searchParams - URLSearchParams object
 * @param defaultSort - Default sort field
 * @param defaultOrder - Default sort order
 * @returns Sort information
 */
export function parseSortParams(
  searchParams: URLSearchParams,
  defaultSort: string = 'createdAt',
  defaultOrder: 'asc' | 'desc' = 'desc'
) {
  const sortBy = searchParams.get('sortBy') || defaultSort
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || defaultOrder

  return { sortBy, sortOrder }
}

/**
 * API handler wrapper - unified error handling
 * 
 * @description Provides unified error handling and logging for API routes
 * @param handler - API handler function
 * @param requiresAuth - Whether authentication is required (default true)
 * @returns Wrapped handler function
 */
export function withApiHandler(
  handler: (request: NextRequest, user?: User) => Promise<NextResponse>,
  requiresAuth: boolean = true
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      let user: User | null = null

      if (requiresAuth) {
        const authResult = await requireApiAuth(request)
        if (!authResult.success) {
          return authResult.response!
        }
        user = authResult.user
      }

      return await handler(request, user || undefined)
    } catch (error) {
      console.error(`API Error [${request.method} ${request.nextUrl.pathname}]:`, error)
      return createApiErrorResponse(
        error instanceof Error ? error.message : 'Internal server error',
        500,
        'INTERNAL_SERVER_ERROR'
      )
    }
  }
}