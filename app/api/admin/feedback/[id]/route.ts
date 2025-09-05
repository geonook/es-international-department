import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin, AUTH_ERRORS } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Feedback Form Details API - /api/admin/feedback/[id]
 * 回饋表單詳情 API
 * 
 * @description Handle individual feedback form operations
 * @features Get, update, delete specific feedback form
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/admin/feedback/[id]
 * Get specific feedback form
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: 'Unauthorized access' 
        }, 
        { status: 401 }
      )
    }

    // Check admin permissions
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: 'Insufficient permissions' 
        },
        { status: 403 }
      )
    }

    const feedbackId = parseInt(params.id)

    if (isNaN(feedbackId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid feedback form ID' },
        { status: 400 }
      )
    }

    // Get feedback form details
    const feedbackForm = await prisma.feedbackForm.findUnique({
      where: { id: feedbackId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        },
        assignee: {
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

    if (!feedbackForm) {
      return NextResponse.json(
        { success: false, message: 'Feedback form not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: feedbackForm
    })

  } catch (error) {
    console.error('Get feedback form error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get feedback form' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/feedback/[id]
 * Update specific feedback form
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: 'Unauthorized access' 
        }, 
        { status: 401 }
      )
    }

    // Check admin permissions
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: 'Insufficient permissions' 
        },
        { status: 403 }
      )
    }

    const feedbackId = parseInt(params.id)

    if (isNaN(feedbackId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid feedback form ID' },
        { status: 400 }
      )
    }

    // Parse request data
    const data = await request.json()

    // Check if feedback form exists
    const existingFeedback = await prisma.feedbackForm.findUnique({
      where: { id: feedbackId }
    })

    if (!existingFeedback) {
      return NextResponse.json(
        { success: false, message: 'Feedback form not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (data.subject !== undefined) updateData.subject = data.subject
    if (data.message !== undefined) updateData.message = data.message
    if (data.category !== undefined) updateData.category = data.category
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.status !== undefined) updateData.status = data.status
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo
    if (data.response !== undefined) {
      updateData.response = data.response
      if (data.response && !existingFeedback.responseDate) {
        updateData.responseDate = new Date()
      }
    }
    if (data.authorName !== undefined) updateData.authorName = data.authorName
    if (data.authorEmail !== undefined) updateData.authorEmail = data.authorEmail

    // Update feedback form
    const updatedFeedback = await prisma.feedbackForm.update({
      where: { id: feedbackId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        },
        assignee: {
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

    return NextResponse.json({
      success: true,
      message: 'Feedback form updated successfully',
      data: updatedFeedback
    })

  } catch (error) {
    console.error('Update feedback form error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update feedback form' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/feedback/[id]
 * Delete specific feedback form
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.TOKEN_REQUIRED,
          message: 'Unauthorized access' 
        }, 
        { status: 401 }
      )
    }

    // Check admin permissions
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: 'Insufficient permissions' 
        },
        { status: 403 }
      )
    }

    const feedbackId = parseInt(params.id)

    if (isNaN(feedbackId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid feedback form ID' },
        { status: 400 }
      )
    }

    // Check if feedback form exists
    const existingFeedback = await prisma.feedbackForm.findUnique({
      where: { id: feedbackId }
    })

    if (!existingFeedback) {
      return NextResponse.json(
        { success: false, message: 'Feedback form not found' },
        { status: 404 }
      )
    }

    // Delete feedback form
    await prisma.feedbackForm.delete({
      where: { id: feedbackId }
    })

    return NextResponse.json({
      success: true,
      message: 'Feedback form deleted successfully'
    })

  } catch (error) {
    console.error('Delete feedback form error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete feedback form' },
      { status: 500 }
    )
  }
}