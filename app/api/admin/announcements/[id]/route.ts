/**
 * Admin Announcements Individual Resource API
 * Admin Announcements Individual Resource API - Requires admin permissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth, createApiErrorResponse } from '@/lib/auth-utils'
import { requireAdmin } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { cacheInvalidation } from '@/lib/cache'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/announcements/[id]
 * Get individual announcement by ID - Admin only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin permissions
  const authResult = await requireAdminAuth(request)
  if (!authResult.success) {
    return authResult.response!
  }

  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid announcement ID',
          message: 'Announcement ID must be a valid number'
        },
        { status: 400 }
      )
    }

    const announcement = await prisma.communication.findFirst({
      where: {
        id,
        type: 'announcement'
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!announcement) {
      return NextResponse.json(
        {
          success: false,
          error: 'Announcement not found',
          message: 'The requested announcement does not exist'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: announcement
    })

  } catch (error) {
    console.error('Get announcement error:', error)
    return createApiErrorResponse('Failed to fetch announcement', 500, 'FETCH_ANNOUNCEMENT_ERROR')
  }
}

/**
 * PUT /api/admin/announcements/[id]
 * Update individual announcement by ID - Admin only
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin permissions
  const adminUser = await requireAdmin(request)
  if (adminUser instanceof NextResponse) {
    return adminUser
  }

  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid announcement ID',
          message: 'Announcement ID must be a valid number'
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      title,
      content,
      summary,
      targetAudience = 'all',
      priority = 'medium',
      status = 'published',
      publishedAt,
      expiresAt,
      isImportant,
      isPinned,
      sourceGroup
    } = body

    // Basic validation
    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Title and content are required fields'
        },
        { status: 400 }
      )
    }

    // Check if announcement exists
    const existingAnnouncement = await prisma.communication.findFirst({
      where: {
        id,
        type: 'announcement'
      }
    })

    if (!existingAnnouncement) {
      return NextResponse.json(
        {
          success: false,
          error: 'Announcement not found',
          message: 'The requested announcement does not exist'
        },
        { status: 404 }
      )
    }

    // Validate targetAudience
    const validAudiences = ['teachers', 'parents', 'all']
    if (!validAudiences.includes(targetAudience)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid target audience',
          message: 'Target audience must be teachers, parents or all'
        },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high']
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid priority',
          message: 'Priority must be low, medium or high'
        },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['draft', 'published', 'archived']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status',
          message: 'Status must be draft, published or archived'
        },
        { status: 400 }
      )
    }

    // Update announcement
    const updatedAnnouncement = await prisma.communication.update({
      where: { id },
      data: {
        title,
        content,
        summary,
        targetAudience,
        priority,
        status,
        publishedAt: publishedAt ? new Date(publishedAt) : (status === 'published' ? new Date() : null),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isImportant: isImportant || false,
        isPinned: isPinned || false,
        sourceGroup: sourceGroup || 'general',
        authorId: adminUser.id // Update author to current admin
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Invalidate announcements cache after update
    cacheInvalidation.announcements()

    return NextResponse.json({
      success: true,
      data: updatedAnnouncement,
      message: 'Announcement updated successfully'
    })

  } catch (error) {
    console.error('Update announcement error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update announcement',
        message: 'Failed to update announcement'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/announcements/[id]
 * Delete individual announcement by ID - Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin permissions
  const adminUser = await requireAdmin(request)
  if (adminUser instanceof NextResponse) {
    return adminUser
  }

  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid announcement ID',
          message: 'Announcement ID must be a valid number'
        },
        { status: 400 }
      )
    }

    // Check if announcement exists
    const existingAnnouncement = await prisma.communication.findFirst({
      where: {
        id,
        type: 'announcement'
      }
    })

    if (!existingAnnouncement) {
      return NextResponse.json(
        {
          success: false,
          error: 'Announcement not found',
          message: 'The requested announcement does not exist'
        },
        { status: 404 }
      )
    }

    // Delete announcement
    await prisma.communication.delete({
      where: { id }
    })

    // Invalidate announcements cache after deletion
    cacheInvalidation.announcements()

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    })

  } catch (error) {
    console.error('Delete announcement error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete announcement',
        message: 'Failed to delete announcement'
      },
      { status: 500 }
    )
  }
}