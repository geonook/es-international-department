import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

/**
 * Public Events API - GET /api/events
 * 公開活動 API - 獲取已發布活動列表
 * 
 * @description 獲取已發布的活動列表，支援篩選、搜尋和分頁
 * @features 分頁、篩選、搜尋、僅顯示已發布活動
 * @author Claude Code | Generated for ES International Department
 */
export async function GET(request: NextRequest) {
  try {
    // 驗證用戶身份（需要登入才能查看活動）
    const authResult = await verifyAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, message: '未授權訪問' }, { status: 401 })
    }

    // 解析查詢參數
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const eventType = searchParams.get('eventType')
    const targetGrade = searchParams.get('targetGrade')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const upcoming = searchParams.get('upcoming') === 'true'
    const featured = searchParams.get('featured') === 'true'

    // 構建篩選條件 - 僅顯示已發布的活動
    const where: any = {
      status: 'published'
    }

    if (eventType && eventType !== 'all') {
      where.eventType = eventType
    }

    if (targetGrade && targetGrade !== 'all') {
      where.targetGrades = {
        array_contains: [targetGrade]
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 日期範圍篩選
    if (startDate || endDate || upcoming) {
      where.startDate = {}
      
      if (upcoming) {
        // 只顯示未來的活動
        where.startDate.gte = new Date()
      } else {
        if (startDate) {
          where.startDate.gte = new Date(startDate)
        }
        if (endDate) {
          where.startDate.lte = new Date(endDate)
        }
      }
    }

    // 精選活動篩選
    if (featured) {
      where.isFeatured = true
    }

    // 計算總數
    const totalCount = await prisma.event.count({ where })
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    // 獲取活動列表
    const events = await prisma.event.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        },
        registrations: {
          select: {
            id: true,
            status: true
          }
        },
        attachments: {
          where: {
            relatedType: 'event'
          },
          select: {
            id: true,
            originalFilename: true,
            filePath: true,
            mimeType: true,
            fileSize: true
          }
        },
        _count: {
          select: {
            registrations: {
              where: {
                status: 'confirmed'
              }
            }
          }
        }
      },
      orderBy: [
        { startDate: upcoming ? 'asc' : 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    // 處理活動資料，添加註冊統計
    const processedEvents = events.map(event => ({
      ...event,
      registrationCount: event._count.registrations,
      isRegistrationOpen: event.registrationRequired && 
        (!event.registrationDeadline || new Date(event.registrationDeadline) > new Date()) &&
        (!event.maxParticipants || event._count.registrations < event.maxParticipants),
      isUserRegistered: event.registrations.some(reg => 
        reg.status === 'confirmed' && 
        event.registrations.find(r => r.status === 'confirmed')
      ),
      spotsRemaining: event.maxParticipants ? 
        event.maxParticipants - event._count.registrations : null,
      // 移除內部計數欄位
      _count: undefined,
      registrations: undefined
    }))

    // 構建分頁資訊
    const pagination = {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }

    // 構建篩選器資訊
    const filters = {
      eventType: eventType || 'all',
      targetGrade: targetGrade || 'all',
      search: search || '',
      dateRange: startDate || endDate ? { start: startDate, end: endDate } : undefined,
      upcoming,
      featured
    }

    return NextResponse.json({
      success: true,
      data: processedEvents,
      pagination,
      filters
    })

  } catch (error) {
    console.error('Get public events error:', error)
    return NextResponse.json(
      { success: false, message: '獲取活動列表失敗' },
      { status: 500 }
    )
  }
}