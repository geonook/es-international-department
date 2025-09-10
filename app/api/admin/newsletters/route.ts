import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin, AUTH_ERRORS } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Newsletter Management API - /api/admin/newsletters
 * 新聞簡報管理系統 API
 * 
 * @description Handle newsletter CRUD operations
 * @features Create, read, update, delete newsletters
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/admin/newsletters
 * Get newsletters list with pagination and filtering
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
    const search = searchParams.get('search')
    const issueNumber = searchParams.get('issue')

    // Build filter conditions
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (issueNumber) {
      where.issueNumber = parseInt(issueNumber)
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Add type filter for communication table - query newsletters as communication type
    const communicationWhere = { 
      ...where, 
      type: 'newsletter',
      // Map newsletter-specific filters to communication fields
      ...(where.issueNumber && { sourceGroup: `Issue ${where.issueNumber}` })
    }
    
    // Remove newsletter-specific fields that don't exist in communication table
    delete communicationWhere.issueNumber

    // Calculate total count and pagination
    const totalCount = await prisma.communication.count({ where: communicationWhere })
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    // Get newsletters from communication table
    const newsletters = await prisma.communication.findMany({
      where: communicationWhere,
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
      },
      orderBy: [
        { publishedAt: 'desc' },
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
      data: newsletters,
      pagination
    })

  } catch (error) {
    console.error('Get newsletters error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get newsletters list' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/newsletters
 * Create new newsletter
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

    // Create newsletter in communication table
    const newsletter = await prisma.communication.create({
      data: {
        title: data.title,
        content: data.content,
        summary: data.htmlContent || null,
        type: 'newsletter',
        targetAudience: 'parents', // Default newsletters to parents
        status: data.status || 'draft',
        sourceGroup: data.issueNumber ? `Issue ${data.issueNumber}` : 'Newsletter',
        publishedAt: data.publicationDate ? new Date(data.publicationDate) : null,
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
      message: 'Newsletter created successfully',
      data: newsletter
    })

  } catch (error) {
    console.error('Create newsletter error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create newsletter' },
      { status: 500 }
    )
  }
}