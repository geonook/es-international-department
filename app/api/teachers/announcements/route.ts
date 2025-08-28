/**
 * Teachers Announcements API
 * Teachers Announcements API - Requires teacher or admin permissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireTeacher } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/teachers/announcements
 * Get announcements visible to teachers
 */
export async function GET(request: NextRequest) {
  // Check teacher permissions (admin can also access)
  const teacherUser = await requireTeacher(request)
  if (teacherUser instanceof NextResponse) {
    return teacherUser
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const priority = searchParams.get('priority')

    const skip = (page - 1) * limit

    // Build query conditions - announcements visible to teachers
    const whereClause: any = {
      status: 'published',
      OR: [
        { targetAudience: 'all' },
        { targetAudience: 'teachers' }
      ]
    }

    if (priority) {
      whereClause.priority = priority
    }

    // Check expiration time
    whereClause.OR = [
      { expiresAt: null },
      { expiresAt: { gte: new Date() } }
    ]

    // Get announcements list
    const [announcements, totalCount] = await Promise.all([
      prisma.announcement.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          content: true,
          summary: true,
          targetAudience: true,
          priority: true,
          publishedAt: true,
          expiresAt: true,
          createdAt: true,
          author: {
            select: {
              displayName: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { publishedAt: 'desc' }
        ]
      }),
      prisma.announcement.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: {
        announcements,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    })

  } catch (error) {
    console.error('Teachers announcements error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch announcements',
        message: 'Failed to get announcements'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/teachers/announcements
 * Create teacher announcement (requires admin permissions or special teacher permissions)
 */
export async function POST(request: NextRequest) {
  // Check teacher permissions
  const teacherUser = await requireTeacher(request)
  if (teacherUser instanceof NextResponse) {
    return teacherUser
  }

  try {
    const body = await request.json()
    const {
      title,
      content,
      summary,
      targetAudience = 'teachers',
      priority = 'medium'
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

    // Teachers can only create announcements for teachers or students
    const allowedAudiences = ['teachers', 'students']
    if (!allowedAudiences.includes(targetAudience)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid target audience',
          message: 'Teachers can only create announcements for teachers or students'
        },
        { status: 403 }
      )
    }

    // Create announcement (status as draft, requires admin approval)
    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        content,
        summary,
        targetAudience,
        priority,
        status: 'draft', // Teacher-created announcements require approval
        authorId: teacherUser.id
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { announcement: newAnnouncement },
      message: 'Announcement created, awaiting approval'
    }, { status: 201 })

  } catch (error) {
    console.error('Teachers create announcement error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create announcement',
        message: 'Failed to create announcement'
      },
      { status: 500 }
    )
  }
}