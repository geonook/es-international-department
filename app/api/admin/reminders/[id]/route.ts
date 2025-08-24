import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin, AUTH_ERRORS } from '@/lib/auth'

/**
 * Teacher Reminder Details API - /api/admin/reminders/[id]
 * 教師提醒詳情 API
 * 
 * @description Handle individual teacher reminder operations
 * @features Get, update, delete specific teacher reminder
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/admin/reminders/[id]
 * Get specific teacher reminder
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

    const reminderId = parseInt(params.id)

    if (isNaN(reminderId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid reminder ID' },
        { status: 400 }
      )
    }

    // Get reminder details
    const reminder = await prisma.teacherReminder.findUnique({
      where: { id: reminderId },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        },
        completer: {
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

    if (!reminder) {
      return NextResponse.json(
        { success: false, message: 'Teacher reminder not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: reminder
    })

  } catch (error) {
    console.error('Get teacher reminder error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get teacher reminder' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/reminders/[id]
 * Update specific teacher reminder
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

    const reminderId = parseInt(params.id)

    if (isNaN(reminderId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid reminder ID' },
        { status: 400 }
      )
    }

    // Parse request data
    const data = await request.json()

    // Check if reminder exists
    const existingReminder = await prisma.teacherReminder.findUnique({
      where: { id: reminderId }
    })

    if (!existingReminder) {
      return NextResponse.json(
        { success: false, message: 'Teacher reminder not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.content !== undefined) updateData.content = data.content
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.status !== undefined) {
      updateData.status = data.status
      // If marking as completed, record completion info
      if (data.status === 'completed' && existingReminder.status !== 'completed') {
        updateData.completedAt = new Date()
        updateData.completedBy = currentUser.id
      }
    }
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
    if (data.dueTime !== undefined) updateData.dueTime = data.dueTime ? new Date(data.dueTime) : null
    if (data.targetAudience !== undefined) updateData.targetAudience = data.targetAudience
    if (data.reminderType !== undefined) updateData.reminderType = data.reminderType
    if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring
    if (data.recurringPattern !== undefined) updateData.recurringPattern = data.recurringPattern

    // Update teacher reminder
    const updatedReminder = await prisma.teacherReminder.update({
      where: { id: reminderId },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        },
        completer: {
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
      message: 'Teacher reminder updated successfully',
      data: updatedReminder
    })

  } catch (error) {
    console.error('Update teacher reminder error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update teacher reminder' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/reminders/[id]
 * Delete specific teacher reminder
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

    const reminderId = parseInt(params.id)

    if (isNaN(reminderId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid reminder ID' },
        { status: 400 }
      )
    }

    // Check if reminder exists
    const existingReminder = await prisma.teacherReminder.findUnique({
      where: { id: reminderId }
    })

    if (!existingReminder) {
      return NextResponse.json(
        { success: false, message: 'Teacher reminder not found' },
        { status: 404 }
      )
    }

    // Delete teacher reminder
    await prisma.teacherReminder.delete({
      where: { id: reminderId }
    })

    return NextResponse.json({
      success: true,
      message: 'Teacher reminder deleted successfully'
    })

  } catch (error) {
    console.error('Delete teacher reminder error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete teacher reminder' },
      { status: 500 }
    )
  }
}