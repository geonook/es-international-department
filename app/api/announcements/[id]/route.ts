/**
 * Individual Announcement API - Get, Update, Delete
 * Single announcement API - query, update, delete endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser, isAdmin, isTeacher, AUTH_ERRORS } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/announcements/[id] - Get single announcement details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcementId = parseInt(params.id)

    if (isNaN(announcementId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid announcement ID',
          message: 'Invalid announcement ID' 
        },
        { status: 400 }
      )
    }

    // Query announcement
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        }
      }
    })

    if (!announcement) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Announcement not found',
          message: 'Announcement not found' 
        },
        { status: 404 }
      )
    }

    // Check if announcement has expired or is unpublished (for general users)
    const currentUser = await getCurrentUser()
    const isAuthorizedUser = currentUser && (isAdmin(currentUser) || isTeacher(currentUser))
    
    if (!isAuthorizedUser) {
      // General users can only view published and unexpired announcements
      if (announcement.status !== 'published') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Announcement not found',
            message: 'Announcement not found' 
          },
          { status: 404 }
        )
      }

      if (announcement.expiresAt && announcement.expiresAt < new Date()) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Announcement has expired',
            message: 'Announcement has expired' 
          },
          { status: 410 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: announcement
    })

  } catch (error) {
    console.error('Get Announcement API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT /api/announcements/[id] - Update announcement
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check user authentication
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: 'Please log in first' 
        },
        { status: 401 }
      )
    }

    const announcementId = parseInt(params.id)

    if (isNaN(announcementId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid announcement ID',
          message: 'Invalid announcement ID' 
        },
        { status: 400 }
      )
    }

    // Query existing announcement
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: announcementId }
    })

    if (!existingAnnouncement) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Announcement not found',
          message: 'Announcement not found' 
        },
        { status: 404 }
      )
    }

    // Check permissions: must be admin or announcement author
    const isAuthor = existingAnnouncement.authorId === currentUser.id
    if (!isAdmin(currentUser) && !isAuthor) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: 'Insufficient permissions: can only modify your own announcements or need admin privileges' 
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      title, 
      content, 
      summary,
      targetAudience,
      priority,
      status,
      publishedAt,
      expiresAt 
    } = body

    // Create update data object
    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (summary !== undefined) updateData.summary = summary
    if (targetAudience !== undefined) {
      // Validate targetAudience value
      const validAudiences = ['teachers', 'parents', 'all']
      if (!validAudiences.includes(targetAudience)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid target audience',
            message: 'Invalid target audience' 
          },
          { status: 400 }
        )
      }
      updateData.targetAudience = targetAudience
    }
    
    if (priority !== undefined) {
      // Validate priority value
      const validPriorities = ['low', 'medium', 'high']
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid priority',
            message: 'Invalid priority level' 
          },
          { status: 400 }
        )
      }
      updateData.priority = priority
    }
    
    if (status !== undefined) {
      // Validate status value
      const validStatuses = ['draft', 'published', 'archived']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid status',
            message: 'Invalid status' 
          },
          { status: 400 }
        )
      }
      updateData.status = status
      
      // If status changed to published and no publish time, set to now
      if (status === 'published' && !existingAnnouncement.publishedAt && !publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    if (publishedAt !== undefined) {
      updateData.publishedAt = publishedAt ? new Date(publishedAt) : null
    }
    
    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null
    }

    // Update announcement
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: announcementId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Announcement updated successfully',
      data: updatedAnnouncement
    })

  } catch (error) {
    console.error('Update Announcement API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Failed to update announcement, please try again later' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE /api/announcements/[id] - Delete announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check user authentication
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: 'Please log in first' 
        },
        { status: 401 }
      )
    }

    const announcementId = parseInt(params.id)

    if (isNaN(announcementId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid announcement ID',
          message: 'Invalid announcement ID' 
        },
        { status: 400 }
      )
    }

    // Query existing announcement
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: announcementId }
    })

    if (!existingAnnouncement) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Announcement not found',
          message: 'Announcement not found' 
        },
        { status: 404 }
      )
    }

    // Check permissions: must be admin or announcement author
    const isAuthor = existingAnnouncement.authorId === currentUser.id
    if (!isAdmin(currentUser) && !isAuthor) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: 'Insufficient permissions: can only delete your own announcements or need admin privileges' 
        },
        { status: 403 }
      )
    }

    // Delete announcement
    await prisma.announcement.delete({
      where: { id: announcementId }
    })

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    })

  } catch (error) {
    console.error('Delete Announcement API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Failed to delete announcement, please try again later' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Unsupported HTTP method
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}