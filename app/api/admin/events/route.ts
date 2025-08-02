import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth, requireAdmin } from '@/lib/auth'
import { EventFormData, EventStats } from '@/lib/types'

/**
 * Admin Events API - GET /api/admin/events
 * 管理員活動 API - 獲取活動列表
 * 
 * @description 獲取活動列表，支援篩選、搜尋和分頁
 * @features 分頁、篩選、搜尋、統計資訊
 * @author Claude Code | Generated for ES International Department
 */
export async function GET(request: NextRequest) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, message: '未授權訪問' }, { status: 401 })
    }

    const adminCheck = await requireAdmin(authResult.user.id)
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, message: '權限不足' }, { status: 403 })
    }

    // 解析查詢參數
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const eventType = searchParams.get('eventType')
    const status = searchParams.get('status')
    const targetGrade = searchParams.get('targetGrade')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // 構建篩選條件
    const where: any = {}

    if (eventType && eventType !== 'all') {
      where.eventType = eventType
    }

    if (status && status !== 'all') {
      where.status = status
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

    if (startDate || endDate) {
      where.startDate = {}
      if (startDate) {
        where.startDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.startDate.lte = new Date(endDate)
      }
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
            email: true,
            firstName: true,
            lastName: true,
            displayName: true
          }
        }
      },
      orderBy: [
        { startDate: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    // 計算統計資訊
    const stats: EventStats = {
      total: totalCount,
      published: await prisma.event.count({ where: { status: 'published' } }),
      draft: await prisma.event.count({ where: { status: 'draft' } }),
      inProgress: await prisma.event.count({ where: { status: 'in_progress' } }),
      completed: await prisma.event.count({ where: { status: 'completed' } }),
      cancelled: await prisma.event.count({ where: { status: 'cancelled' } }),
      byType: {},
      byMonth: {},
      totalRegistrations: 0,
      averageParticipants: 0
    }

    // 按類型統計
    const typeStats = await prisma.event.groupBy({
      by: ['eventType'],
      _count: true
    })
    
    for (const stat of typeStats) {
      stats.byType[stat.eventType] = stat._count
    }

    // 按月份統計（當年）
    const currentYear = new Date().getFullYear()
    const monthlyStats = await prisma.event.groupBy({
      by: ['startDate'],
      where: {
        startDate: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`)
        }
      },
      _count: true
    })

    for (const stat of monthlyStats) {
      const month = new Date(stat.startDate).toLocaleDateString('zh-TW', { month: 'long' })
      stats.byMonth[month] = (stats.byMonth[month] || 0) + stat._count
    }

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
      status: status || 'all',
      targetGrade: targetGrade || 'all',
      search: search || '',
      dateRange: startDate || endDate ? { start: startDate, end: endDate } : undefined
    }

    return NextResponse.json({
      success: true,
      data: events,
      pagination,
      filters,
      stats
    })

  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { success: false, message: '獲取活動列表失敗' },
      { status: 500 }
    )
  }
}

/**
 * Admin Events API - POST /api/admin/events
 * 管理員活動 API - 建立新活動
 */
export async function POST(request: NextRequest) {
  try {
    // 驗證管理員權限
    const authResult = await verifyAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, message: '未授權訪問' }, { status: 401 })
    }

    const adminCheck = await requireAdmin(authResult.user.id)
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, message: '權限不足' }, { status: 403 })
    }

    // 解析請求資料
    const data: EventFormData = await request.json()

    // 驗證必填欄位
    if (!data.title || !data.eventType || !data.startDate || !data.status) {
      return NextResponse.json(
        { success: false, message: '缺少必填欄位' },
        { status: 400 }
      )
    }

    // 驗證日期邏輯
    if (data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
      return NextResponse.json(
        { success: false, message: '結束日期不能早於開始日期' },
        { status: 400 }
      )
    }

    // 建立活動資料
    const eventData: any = {
      title: data.title,
      description: data.description,
      eventType: data.eventType,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      startTime: data.startTime ? new Date(`1970-01-01T${data.startTime}:00`) : null,
      endTime: data.endTime ? new Date(`1970-01-01T${data.endTime}:00`) : null,
      location: data.location,
      maxParticipants: data.maxParticipants,
      registrationRequired: data.registrationRequired,
      registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
      targetGrades: data.targetGrades || [],
      status: data.status,
      createdBy: authResult.user.id
    }

    // 建立活動
    const event = await prisma.event.create({
      data: eventData,
      include: {
        creator: {
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
      message: '活動建立成功',
      data: event
    })

  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { success: false, message: '建立活動失敗' },
      { status: 500 }
    )
  }
}