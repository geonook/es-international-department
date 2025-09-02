/**
 * Individual Communication API - v1
 * 個別通訊 API - v1 版本
 * 
 * Endpoints:
 * - GET /api/v1/communications/[id] - Get single communication
 * - PUT /api/v1/communications/[id] - Update communication
 * - DELETE /api/v1/communications/[id] - Delete communication
 */

import { NextRequest } from 'next/server'
import { CommunicationController } from '@/lib/controllers/CommunicationController'
import { withAuth, withOfficeMember, withAdmin } from '@/lib/middleware/unified-auth'

/**
 * GET /api/v1/communications/[id]
 * Get single communication by ID
 * 
 * Accessible by: All authenticated users (with role-based visibility)
 */
export const GET = withAuth(async (request: NextRequest, user, context: any) => {
  try {
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const id = pathSegments[pathSegments.length - 1]
    
    const response = await CommunicationController.getById(
      id,
      user.role,
      user.id
    )
    
    return Response.json(response, {
      status: response.success ? 200 : (response.error === 'Communication not found' ? 404 : 403),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': response.success ? 'public, max-age=300' : 'no-cache', // 5 minute cache for individual items
      }
    })
    
  } catch (error) {
    console.error(`GET /api/v1/communications/${id} error:`, error)
    return Response.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
})

/**
 * PUT /api/v1/communications/[id]
 * Update communication by ID
 * 
 * Body: Partial communication data (same as POST but all fields optional)
 * 
 * Requires: office_member or admin role
 * Note: Non-admin users can only edit their own communications
 */
export const PUT = withOfficeMember(async (request: NextRequest, user, context: any) => {
  try {
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const id = pathSegments[pathSegments.length - 1]
    
    const response = await CommunicationController.update(
      id,
      request,
      user.role,
      user.id
    )
    
    return Response.json(response, {
      status: response.success ? 200 : (
        response.error === 'Communication not found' ? 404 :
        response.error?.includes('permission') ? 403 : 400
      ),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })
    
  } catch (error) {
    console.error(`PUT /api/v1/communications/${id} error:`, error)
    return Response.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/v1/communications/[id]
 * Delete communication by ID
 * 
 * Requires: admin role only
 * Note: This will also delete all associated replies
 */
export const DELETE = withAdmin(async (request: NextRequest, user, context: any) => {
  try {
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const id = pathSegments[pathSegments.length - 1]
    
    const response = await CommunicationController.delete(
      id,
      user.role,
      user.id
    )
    
    return Response.json(response, {
      status: response.success ? 200 : (
        response.error === 'Communication not found' ? 404 : 403
      ),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })
    
  } catch (error) {
    console.error(`DELETE /api/v1/communications/${id} error:`, error)
    return Response.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
})