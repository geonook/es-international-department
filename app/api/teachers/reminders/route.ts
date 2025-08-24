import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'

/**
 * Teacher Reminders Public API - /api/teachers/reminders
 * 教師提醒公開 API
 * 
 * @description Public API for teachers to view reminders (no admin required)
 * @features Get active reminders visible to teachers
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/teachers/reminders
 * Get active teacher reminders (public access for authenticated teachers)
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // Filter by reminder type
    const priority = searchParams.get('priority') // Filter by priority

    // Build filter conditions - only show active reminders
    const where: any = {
      status: 'active'
    }

    if (type) {
      where.reminderType = type
    }

    if (priority) {
      where.priority = priority
    }

    // Get active reminders for teachers
    const reminders = await prisma.teacherReminder.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // Separate urgent and regular reminders
    const urgentReminders = reminders.filter(r => r.priority === 'high')
    const regularReminders = reminders.filter(r => r.priority !== 'high')

    return NextResponse.json({
      success: true,
      data: {
        urgent: urgentReminders,
        regular: regularReminders,
        total: reminders.length,
        totalUrgent: urgentReminders.length
      }
    })

  } catch (error) {
    console.error('Get teacher reminders error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get teacher reminders' },
      { status: 500 }
    )
  }
}