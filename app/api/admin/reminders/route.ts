import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin, AUTH_ERRORS } from '@/lib/auth'

/**
 * Teacher Reminders API - /api/admin/reminders
 * 教師提醒系統 API
 * 
 * @description Handle teacher reminder CRUD operations
 * @features Create, read, update, delete teacher reminders
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/admin/reminders
 * Get teacher reminders list
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

    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const reminderType = searchParams.get('type')

    // Build filter conditions
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
    }

    if (reminderType) {
      where.reminderType = reminderType
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    const skip = (page - 1) * limit

    // PERFORMANCE OPTIMIZED: Batch queries and use select for minimal data transfer
    const [reminders, totalCount] = await Promise.all([
      prisma.teacherReminder.findMany({
        where,
        select: {
          id: true,
          title: true,
          content: true,
          priority: true,
          status: true,
          dueDate: true,
          dueTime: true,
          targetAudience: true,
          reminderType: true,
          isRecurring: true,
          recurringPattern: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
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
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.teacherReminder.count({ where })
    ])
    
    const totalPages = Math.ceil(totalCount / limit)

    // Build pagination info
    const pagination = {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }

    return NextResponse.json({
      success: true,
      data: reminders,
      pagination
    })

  } catch (error) {
    console.error('Get teacher reminders error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get teacher reminders list' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/reminders
 * Create new teacher reminder
 */
export async function POST(request: NextRequest) {
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

    // Parse request data
    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        { success: false, message: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Create teacher reminder
    const reminder = await prisma.teacherReminder.create({
      data: {
        title: data.title,
        content: data.content,
        priority: data.priority || 'medium',
        status: data.status || 'active',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        dueTime: data.dueTime ? new Date(data.dueTime) : null,
        targetAudience: data.targetAudience || 'all',
        reminderType: data.reminderType || 'general',
        isRecurring: data.isRecurring || false,
        recurringPattern: data.recurringPattern || null,
        createdBy: currentUser.id
      },
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
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Teacher reminder created successfully',
      data: reminder
    })

  } catch (error) {
    console.error('Create teacher reminder error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create teacher reminder' },
      { status: 500 }
    )
  }
}