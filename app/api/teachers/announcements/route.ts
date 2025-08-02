/**
 * Teachers Announcements API
 * 教師公告 API - 需要教師或管理員權限
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireTeacher } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/teachers/announcements
 * 獲取教師可見的公告
 */
export async function GET(request: NextRequest) {
  // 檢查教師權限 (管理員也可存取)
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

    // 建構查詢條件 - 教師可見公告
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

    // 檢查過期時間
    whereClause.OR = [
      { expiresAt: null },
      { expiresAt: { gte: new Date() } }
    ]

    // 獲取公告列表
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
        message: '獲取公告失敗'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/teachers/announcements
 * 創建教師公告 (需要管理員權限或特殊教師權限)
 */
export async function POST(request: NextRequest) {
  // 檢查教師權限
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

    // 基本驗證
    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: '標題和內容為必填欄位'
        },
        { status: 400 }
      )
    }

    // 教師只能創建給教師或學生的公告
    const allowedAudiences = ['teachers', 'students']
    if (!allowedAudiences.includes(targetAudience)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid target audience',
          message: '教師只能創建給教師或學生的公告'
        },
        { status: 403 }
      )
    }

    // 創建公告 (狀態為 draft，需要管理員審核)
    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        content,
        summary,
        targetAudience,
        priority,
        status: 'draft', // 教師創建的公告需要審核
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
      message: '公告已創建，等待審核'
    }, { status: 201 })

  } catch (error) {
    console.error('Teachers create announcement error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create announcement',
        message: '創建公告失敗'
      },
      { status: 500 }
    )
  }
}