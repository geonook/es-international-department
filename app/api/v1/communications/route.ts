/**
 * Unified Communications API - v1
 * 統一通訊 API - v1 版本
 * 
 * This endpoint replaces:
 * - /api/announcements
 * - /api/admin/messages  
 * - /api/teachers/messages
 * - /api/reminders
 * 
 * Features:
 * - Single endpoint for all communication types
 * - Role-based access control
 * - Consistent response format
 * - Intelligent caching
 * - Type filtering support
 */

import { NextRequest } from 'next/server'
import { CommunicationController } from '@/lib/controllers/CommunicationController'
import { withAuth, withOfficeMember } from '@/lib/middleware/unified-auth'

/**
 * GET /api/v1/communications
 * List communications with filtering and pagination
 * 
 * Query Parameters:
 * - type: 'announcement' | 'message' | 'reminder' | 'newsletter'
 * - sourceGroup: 'Vickie' | 'Matthew' | 'Academic Team' | etc.
 * - boardType: 'teachers' | 'parents' | 'general'
 * - status: 'draft' | 'published' | 'archived' | 'closed'
 * - priority: 'low' | 'medium' | 'high'
 * - isPinned: boolean
 * - isImportant: boolean
 * - search: string
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - sortBy: 'createdAt' | 'updatedAt' | 'publishedAt' | etc.
 * - sortOrder: 'asc' | 'desc'
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const response = await CommunicationController.list(
      request,
      user.role,
      user.id
    )
    
    return Response.json(response, {
      status: response.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // 1 minute cache for lists
      }
    })
    
  } catch (error) {
    console.error('GET /api/v1/communications error:', error)
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
 * POST /api/v1/communications
 * Create new communication
 * 
 * Body:
 * - title: string (required)
 * - content: string (required)
 * - summary?: string
 * - type: CommunicationType (required)
 * - sourceGroup?: SourceGroup
 * - targetAudience: TargetAudience (default: 'all')
 * - boardType: BoardType (default: 'general')
 * - priority: PriorityLevel (default: 'medium')
 * - status: StatusValue (default: 'draft')
 * - isImportant: boolean (default: false)
 * - isPinned: boolean (default: false)
 * - isFeatured: boolean (default: false)
 * - publishedAt?: string (ISO date)
 * - expiresAt?: string (ISO date)
 * 
 * Requires: office_member or admin role
 */
export const POST = withOfficeMember(async (request: NextRequest, user) => {
  try {
    const response = await CommunicationController.create(
      request,
      user.role,
      user.id
    )
    
    return Response.json(response, {
      status: response.success ? 201 : 400,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })
    
  } catch (error) {
    console.error('POST /api/v1/communications error:', error)
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