import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

/**
 * Events Calendar API - GET /api/events/calendar
 * 活動日曆 API - 獲取日曆格式的活動資料
 * 
 * @description 提供適合日曆組件使用的活動資料格式
 * @features 月份檢視、年度檢視、活動摘要、快速篩選
 * @author Claude Code | Generated for ES International Department
 */
export async function GET(request: NextRequest) {
  try {
    // 驗證用戶身份
    const authResult = await verifyAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, message: '未授權訪問' }, { status: 401 })
    }

    // 解析查詢參數
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null
    const eventType = searchParams.get('eventType')
    const targetGrade = searchParams.get('targetGrade')
    const userOnly = searchParams.get('userOnly') === 'true' // 僅顯示用戶報名的活動

    // 構建日期範圍
    let startDate: Date
    let endDate: Date

    if (month !== null) {
      // 月份檢視
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59)
    } else {
      // 年度檢視
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31, 23, 59, 59)
    }

    // 構建篩選條件
    const where: any = {
      status: 'published',
      startDate: {
        gte: startDate,
        lte: endDate
      }
    }

    if (eventType && eventType !== 'all') {
      where.eventType = eventType
    }

    if (targetGrade && targetGrade !== 'all') {
      where.targetGrades = {
        array_contains: [targetGrade]
      }
    }

    // 如果只要用戶報名的活動
    if (userOnly) {
      where.registrations = {
        some: {
          userId: authResult.user.id,
          status: {
            in: ['confirmed', 'waiting_list']
          }
        }
      }
    }

    // 獲取活動資料
    const events = await prisma.event.findMany({
      where,
      include: {
        creator: {
          select: {
            displayName: true,
            firstName: true,
            lastName: true
          }
        },
        registrations: userOnly ? {
          where: {
            userId: authResult.user.id
          },
          select: {
            id: true,
            status: true,
            participantName: true,
            grade: true
          }
        } : {
          where: {
            status: 'confirmed'
          },
          select: {
            id: true
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
      orderBy: {
        startDate: 'asc'
      }
    })

    // 轉換為日曆格式
    const calendarEvents = events.map(event => {
      const userRegistration = userOnly ? event.registrations[0] : null
      
      return {
        id: event.id,
        title: event.title,
        start: event.startDate,
        end: event.endDate || event.startDate,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        eventType: event.eventType,
        targetGrades: event.targetGrades,
        description: event.description,
        creator: event.creator ? 
          event.creator.displayName || 
          `${event.creator.firstName} ${event.creator.lastName}`.trim() : 
          null,
        registrationRequired: event.registrationRequired,
        registrationDeadline: event.registrationDeadline,
        maxParticipants: event.maxParticipants,
        registrationCount: event._count.registrations,
        spotsRemaining: event.maxParticipants ? 
          event.maxParticipants - event._count.registrations : null,
        userRegistration: userRegistration ? {
          id: userRegistration.id,
          status: userRegistration.status,
          participantName: userRegistration.participantName,
          grade: userRegistration.grade
        } : null,
        isUserRegistered: !!userRegistration,
        className: getEventClassName(event.eventType, userRegistration?.status),
        color: getEventColor(event.eventType),
        allDay: !event.startTime && !event.endTime,
        url: `/events/${event.id}` // 前端路由
      }
    })

    // 按月份分組（如果是年度檢視）
    const groupedByMonth = month === null ? groupEventsByMonth(calendarEvents) : null

    // 計算統計資訊
    const stats = {
      totalEvents: events.length,
      byType: {} as Record<string, number>,
      byMonth: {} as Record<string, number>,
      userRegistrations: userOnly ? events.filter(e => e.registrations.length > 0).length : 
        await prisma.eventRegistration.count({
          where: {
            userId: authResult.user.id,
            status: {
              in: ['confirmed', 'waiting_list']
            },
            event: {
              startDate: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        })
    }

    // 統計各類型活動數量
    for (const event of events) {
      stats.byType[event.eventType] = (stats.byType[event.eventType] || 0) + 1
    }

    // 統計各月份活動數量（年度檢視時）
    if (month === null) {
      for (const event of events) {
        const monthKey = new Date(event.startDate).toLocaleDateString('zh-TW', { 
          year: 'numeric', 
          month: 'long' 
        })
        stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        events: calendarEvents,
        groupedByMonth,
        period: {
          year,
          month,
          startDate,
          endDate
        },
        stats
      }
    })

  } catch (error) {
    console.error('Get calendar events error:', error)
    return NextResponse.json(
      { success: false, message: '獲取日曆資料失敗' },
      { status: 500 }
    )
  }
}

/**
 * 根據活動類型和用戶報名狀態生成 CSS 類名
 */
function getEventClassName(eventType: string, userRegistrationStatus?: string): string {
  const baseClass = `event-${eventType.toLowerCase().replace(/\s+/g, '-')}`
  
  if (userRegistrationStatus === 'confirmed') {
    return `${baseClass} user-registered`
  } else if (userRegistrationStatus === 'waiting_list') {
    return `${baseClass} user-waiting`
  }
  
  return baseClass
}

/**
 * 根據活動類型獲取顏色
 */
function getEventColor(eventType: string): string {
  const colorMap: Record<string, string> = {
    'academic': '#3B82F6', // 學術活動 - 藍色
    'sports': '#10B981', // 體育活動 - 綠色
    'cultural': '#8B5CF6', // 文化活動 - 紫色
    'parent_meeting': '#F59E0B', // 家長會 - 橙色
    'field_trip': '#EF4444', // 戶外教學 - 紅色
    'workshop': '#6366F1', // 工作坊 - 靛色
    'celebration': '#EC4899', // 慶祝活動 - 粉色
    'meeting': '#6B7280', // 會議 - 灰色
    'conference': '#059669', // 會議 - 綠色
    'other': '#9CA3AF' // 其他 - 淺灰色
  }
  
  return colorMap[eventType] || colorMap['other']
}

/**
 * 將活動按月份分組
 */
function groupEventsByMonth(events: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {}
  
  for (const event of events) {
    const monthKey = new Date(event.start).toLocaleDateString('zh-TW', { 
      year: 'numeric', 
      month: 'numeric' 
    })
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = []
    }
    
    grouped[monthKey].push(event)
  }
  
  return grouped
}