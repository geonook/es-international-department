import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'

/**
 * Public Event API - GET /api/events/[id]
 * 公開活動 API - 獲取單一活動詳情
 * 
 * @description 獲取單一已發布活動的詳細資訊
 * @author Claude Code | Generated for ES International Department
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證用戶身份
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: '未授權訪問' 
      }, { status: 401 })
    }

    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: '無效的活動ID' },
        { status: 400 }
      )
    }

    // 獲取活動詳情 - 僅顯示已發布的活動
    const event = await prisma.event.findFirst({
      where: { 
        id: eventId,
        status: 'published' // 只有已發布的活動才能被公開查看
      },
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
          where: {
            status: 'confirmed'
          },
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                firstName: true,
                lastName: true
              }
            }
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
            fileSize: true,
            createdAt: true
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
      }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, message: '活動不存在或尚未發布' },
        { status: 404 }
      )
    }

    // 檢查當前用戶是否已報名
    const userRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: currentUser.id
        }
      }
    })

    // 處理活動資料
    const processedEvent = {
      ...event,
      registrationCount: event._count.registrations,
      isRegistrationOpen: event.registrationRequired && 
        (!event.registrationDeadline || new Date(event.registrationDeadline) > new Date()) &&
        (!event.maxParticipants || event._count.registrations < event.maxParticipants) &&
        event.status === 'published',
      userRegistration: userRegistration ? {
        id: userRegistration.id,
        status: userRegistration.status,
        registeredAt: userRegistration.registeredAt,
        participantName: userRegistration.participantName,
        grade: userRegistration.grade
      } : null,
      isUserRegistered: !!userRegistration && userRegistration.status === 'confirmed',
      isUserOnWaitingList: !!userRegistration && userRegistration.status === 'waiting_list',
      spotsRemaining: event.maxParticipants ? 
        event.maxParticipants - event._count.registrations : null,
      canRegister: event.registrationRequired && 
        !userRegistration && 
        (!event.registrationDeadline || new Date(event.registrationDeadline) > new Date()) &&
        (!event.maxParticipants || event._count.registrations < event.maxParticipants),
      canCancelRegistration: !!userRegistration && 
        userRegistration.status !== 'cancelled' &&
        (!event.registrationDeadline || new Date(event.registrationDeadline) > new Date()),
      // 移除敏感資訊和內部欄位
      _count: undefined,
      registrations: event.registrations.map(reg => ({
        id: reg.id,
        participantName: reg.participantName || reg.user.displayName || 
          `${reg.user.firstName} ${reg.user.lastName}`.trim(),
        grade: reg.grade,
        registeredAt: reg.registeredAt
      }))
    }

    return NextResponse.json({
      success: true,
      data: processedEvent
    })

  } catch (error) {
    console.error('Get event error:', error)
    return NextResponse.json(
      { success: false, message: '獲取活動失敗' },
      { status: 500 }
    )
  }
}