import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin, AUTH_ERRORS } from '@/lib/auth'

/**
 * Message Board Management API - /api/admin/messages
 * 訊息公告板管理系統 API
 * 
 * @description Handle message board CRUD operations
 * @features Create, read, update, delete message board posts
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/admin/messages
 * Get message board posts with pagination and filtering
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
    const boardType = searchParams.get('boardType') // 'teachers', 'parents', 'general'
    const sourceGroup = searchParams.get('sourceGroup') // 'Vickie', 'Matthew', 'Academic Team', etc.
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const isPinned = searchParams.get('pinned') // 'true', 'false', or null for all
    const isImportant = searchParams.get('important') // 'true', 'false', or null for all

    // Build filter conditions
    const where: any = {}

    if (boardType) {
      where.boardType = boardType
    }

    if (sourceGroup) {
      where.sourceGroup = sourceGroup
    }

    if (status) {
      where.status = status
    }

    if (isPinned === 'true') {
      where.isPinned = true
    } else if (isPinned === 'false') {
      where.isPinned = false
    }

    if (isImportant === 'true') {
      where.isImportant = true
    } else if (isImportant === 'false') {
      where.isImportant = false
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Add type filter for message board communications
    where.type = 'message_board'

    // Calculate total count and pagination
    const totalCount = await prisma.communication.count({ where })
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    // Get message board posts from unified Communication table
    const messages = await prisma.communication.findMany({
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
        replies: {
          take: 3, // Get first 3 replies for preview
          orderBy: { createdAt: 'desc' },
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
        }
      },
      orderBy: [
        { isImportant: 'desc' },
        { isPinned: 'desc' },
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
      data: messages,
      pagination
    })

  } catch (error) {
    console.error('Get message board posts error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get message board posts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/messages
 * Create new message board post
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

    // Create message board post in unified Communication table
    const message = await prisma.communication.create({
      data: {
        title: data.title,
        content: data.content,
        type: 'message_board', // Set type for message board
        boardType: data.boardType || 'general',
        sourceGroup: data.sourceGroup || null,
        isImportant: data.isImportant || false,
        isPinned: data.isPinned || false,
        status: data.status || 'published', // Use 'published' instead of 'active'
        authorId: currentUser.id
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

    return NextResponse.json({
      success: true,
      message: 'Message board post created successfully',
      data: message
    })

  } catch (error) {
    console.error('Create message board post error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create message board post' },
      { status: 500 }
    )
  }
}