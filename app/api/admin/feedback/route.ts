import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin, AUTH_ERRORS } from '@/lib/auth'

/**
 * Feedback Forms Management API - /api/admin/feedback
 * 回饋表單管理系統 API
 * 
 * @description Handle feedback form CRUD operations
 * @features Create, read, update, delete feedback forms
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/admin/feedback
 * Get feedback forms list with pagination and filtering
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
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const assigned = searchParams.get('assigned') // 'true', 'false', or null for all

    // Build filter conditions
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (category) {
      where.category = category
    }

    if (priority) {
      where.priority = priority
    }

    if (assigned === 'true') {
      where.assignedTo = { not: null }
    } else if (assigned === 'false') {
      where.assignedTo = null
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { authorName: { contains: search, mode: 'insensitive' } },
        { authorEmail: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Calculate total count and pagination
    const totalCount = await prisma.feedbackForm.count({ where })
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    // Get feedback forms list
    const feedbackForms = await prisma.feedbackForm.findMany({
      where,
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
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

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
      data: feedbackForms,
      pagination
    })

  } catch (error) {
    console.error('Get feedback forms error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get feedback forms list' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/feedback
 * Create new feedback form
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
    if (!data.subject || !data.message) {
      return NextResponse.json(
        { success: false, message: 'Subject and message are required' },
        { status: 400 }
      )
    }

    // Create feedback form
    const feedbackForm = await prisma.feedbackForm.create({
      data: {
        subject: data.subject,
        message: data.message,
        category: data.category || null,
        priority: data.priority || 'medium',
        status: data.status || 'new',
        isAnonymous: data.isAnonymous || false,
        authorId: data.isAnonymous ? null : currentUser.id,
        authorName: data.isAnonymous ? data.authorName : null,
        authorEmail: data.isAnonymous ? data.authorEmail : null,
        assignedTo: data.assignedTo || null
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
      message: 'Feedback form created successfully',
      data: feedbackForm
    })

  } catch (error) {
    console.error('Create feedback form error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create feedback form' },
      { status: 500 }
    )
  }
}