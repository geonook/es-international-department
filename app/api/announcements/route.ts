/**
 * Announcements API - List and Create
 * Announcements API - List Query and Create Endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser, isAdmin, isTeacher, AUTH_ERRORS } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/announcements - Get announcements list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Filter parameters
    const targetAudience = searchParams.get('targetAudience')
    const priority = searchParams.get('priority') 
    const status = searchParams.get('status') || 'published' // Default to show only published announcements
    const search = searchParams.get('search')

    // Build query conditions
    const where: any = {}
    
    if (targetAudience && targetAudience !== 'all') {
      where.targetAudience = targetAudience
    }
    
    if (priority) {
      where.priority = priority
    }
    
    if (status) {
      where.status = status
    }
    
    // Filter out expired announcements by default
    const includeExpired = searchParams.get('includeExpired') === 'true'
    if (!includeExpired) {
      where.OR = [
        { expiresAt: null }, // Announcements without expiry
        { expiresAt: { gt: new Date() } } // Non-expired announcements
      ]
    }
    
    if (search) {
      // If there are search conditions, need to adjust OR logic
      if (where.OR && !includeExpired) {
        where.AND = [
          {
            OR: where.OR // Expiry conditions
          },
          {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
              { summary: { contains: search, mode: 'insensitive' } }
            ]
          }
        ]
        delete where.OR
      } else {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    // Execute query
    const [rawAnnouncements, totalCount] = await Promise.all([
      prisma.announcement.findMany({
        where,
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
        },
        orderBy: [
          { publishedAt: 'desc' }, 
          { updatedAt: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.announcement.count({ where })
    ])

    // Intelligent sorting: Calculate weight score for each announcement
    const announcements = rawAnnouncements.map(announcement => {
      const now = new Date()
      const publishedAt = announcement.publishedAt || announcement.createdAt
      const daysSincePublished = Math.floor((now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24))
      
      // Priority weight (high > medium > low)
      const priorityWeight = {
        'high': 100,
        'medium': 50,
        'low': 20
      }[announcement.priority] || 20
      
      // Freshness weight (newer items have higher weight)
      const freshnessWeight = Math.max(0, 30 - daysSincePublished)
      
      // Urgency weight (items about to expire have higher weight)
      let urgencyWeight = 0
      if (announcement.expiresAt) {
        const hoursUntilExpiry = Math.floor((announcement.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60))
        if (hoursUntilExpiry > 0 && hoursUntilExpiry <= 48) {
          urgencyWeight = 50 - hoursUntilExpiry // Weight for items expiring within 48 hours
        }
      }
      
      const totalScore = priorityWeight + freshnessWeight + urgencyWeight
      
      return {
        ...announcement,
        _sortScore: totalScore
      }
    })

    // Resort based on calculated scores
    announcements.sort((a, b) => b._sortScore - a._sortScore)

    // Remove sort scores (don't return to client)
    const finalAnnouncements = announcements.map(({ _sortScore, ...announcement }) => announcement)

    // Calculate pagination information
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: finalAnnouncements,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        targetAudience,
        priority,
        status,
        search,
        includeExpired
      }
    })

  } catch (error) {
    console.error('Get Announcements API Error:', error)
    
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

// POST /api/announcements - Create new announcement
export async function POST(request: NextRequest) {
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

    // Check permissions: requires admin or teacher role
    if (!isAdmin(currentUser) && !isTeacher(currentUser)) {
      return NextResponse.json(
        { 
          success: false, 
          error: AUTH_ERRORS.ACCESS_DENIED,
          message: 'Insufficient permissions: admin or teacher role required' 
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      title, 
      content, 
      summary,
      targetAudience = 'all',
      priority = 'medium',
      status = 'draft',
      publishedAt,
      expiresAt 
    } = body

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Title and content are required',
          message: 'Title and content are required fields' 
        },
        { status: 400 }
      )
    }

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

    // Create announcement data
    const announcementData: any = {
      title,
      content,
      summary,
      authorId: currentUser.id,
      targetAudience,
      priority,
      status
    }

    // Handle publish time
    if (status === 'published' && !publishedAt) {
      announcementData.publishedAt = new Date()
    } else if (publishedAt) {
      announcementData.publishedAt = new Date(publishedAt)
    }

    // Handle expiry time
    if (expiresAt) {
      announcementData.expiresAt = new Date(expiresAt)
    }

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: announcementData,
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
      message: 'Announcement created successfully',
      data: announcement
    }, { status: 201 })

  } catch (error) {
    console.error('Create Announcement API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Failed to create announcement, please try again later' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Unsupported HTTP methods
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}