import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'

/**
 * Event Registration API - /api/events/[id]/registration
 * Event registration API
 * 
 * @description Handle event registration related operations
 * @features Add registration, cancel registration, check registration status, waiting list management
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/events/[id]/registration
 * Get user's registration status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user identity
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: 'Unauthorized access' 
      }, { status: 401 })
    }

    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid event ID' },
        { status: 400 }
      )
    }

    // Check if event exists and is published
    const event = await prisma.event.findFirst({
      where: { 
        id: eventId,
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        registrationRequired: true,
        registrationDeadline: true,
        maxParticipants: true,
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
        { success: false, message: 'Event does not exist or is not published' },
        { status: 404 }
      )
    }

    if (!event.registrationRequired) {
      return NextResponse.json(
        { success: false, message: 'This event does not require registration' },
        { status: 400 }
      )
    }

    // Query user registration status
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: currentUser.id
        }
      },
      select: {
        id: true,
        status: true,
        participantName: true,
        participantEmail: true,
        participantPhone: true,
        grade: true,
        specialRequests: true,
        registeredAt: true,
        checkedIn: true,
        checkedInAt: true
      }
    })

    // Calculate registration status
    const registrationCount = event._count.registrations
    const spotsAvailable = event.maxParticipants ? event.maxParticipants - registrationCount : null
    const isRegistrationOpen = !event.registrationDeadline || new Date(event.registrationDeadline) > new Date()
    const canRegister = !registration && isRegistrationOpen && 
      (!event.maxParticipants || registrationCount < event.maxParticipants)
    const canCancelRegistration = registration && 
      registration.status !== 'cancelled' && isRegistrationOpen

    return NextResponse.json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          registrationRequired: event.registrationRequired,
          registrationDeadline: event.registrationDeadline,
          maxParticipants: event.maxParticipants,
          registrationCount,
          spotsAvailable,
          isRegistrationOpen
        },
        registration,
        canRegister,
        canCancelRegistration
      }
    })

  } catch (error) {
    console.error('Get registration status error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get registration status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/events/[id]/registration
 * Add event registration
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user identity
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: 'Unauthorized access' 
      }, { status: 401 })
    }

    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid event ID' },
        { status: 400 }
      )
    }

    // Parse request data
    const data = await request.json()
    const {
      participantName,
      participantEmail,
      participantPhone,
      grade,
      specialRequests
    } = data

    // Check if event exists and requires registration
    const event = await prisma.event.findFirst({
      where: { 
        id: eventId,
        status: 'published',
        registrationRequired: true
      },
      select: {
        id: true,
        title: true,
        registrationDeadline: true,
        maxParticipants: true,
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
        { success: false, message: 'Event does not exist, is not published, or does not require registration' },
        { status: 404 }
      )
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date(event.registrationDeadline) <= new Date()) {
      return NextResponse.json(
        { success: false, message: 'Registration deadline has passed' },
        { status: 400 }
      )
    }

    // Check if already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: currentUser.id
        }
      }
    })

    if (existingRegistration && existingRegistration.status !== 'cancelled') {
      return NextResponse.json(
        { success: false, message: '您已報名此活動' },
        { status: 400 }
      )
    }

    // 檢查報名人數限制
    const registrationCount = event._count.registrations
    let registrationStatus = 'confirmed'

    if (event.maxParticipants && registrationCount >= event.maxParticipants) {
      registrationStatus = 'waiting_list'
    }

    // 建立或更新報名記錄
    const registrationData = {
      eventId,
      userId: currentUser.id,
      participantName: participantName || currentUser.displayName,
      participantEmail: participantEmail || currentUser.email,
      participantPhone,
      grade,
      specialRequests,
      status: registrationStatus
    }

    let registration
    if (existingRegistration) {
      // 重新啟用已取消的報名
      registration = await prisma.eventRegistration.update({
        where: { id: existingRegistration.id },
        data: {
          ...registrationData,
          registeredAt: new Date()
        }
      })
    } else {
      // 建立新報名
      registration = await prisma.eventRegistration.create({
        data: registrationData
      })
    }

    // 建立報名確認通知
    await prisma.eventNotification.create({
      data: {
        eventId,
        type: 'registration_confirmed',
        recipientType: 'specific_users',
        title: `報名確認：${event.title}`,
        message: registrationStatus === 'confirmed' 
          ? `您已成功報名 ${event.title}。我們期待您的參與！`
          : `您已加入 ${event.title} 的候補名單。如有名額空出，我們會立即通知您。`,
        recipientCount: 1,
        createdBy: currentUser.id
      }
    })

    return NextResponse.json({
      success: true,
      message: registrationStatus === 'confirmed' 
        ? '報名成功！' 
        : '已加入候補名單',
      data: {
        id: registration.id,
        status: registration.status,
        registeredAt: registration.registeredAt,
        participantName: registration.participantName,
        grade: registration.grade
      }
    })

  } catch (error) {
    console.error('Create registration error:', error)
    return NextResponse.json(
      { success: false, message: '報名失敗' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/events/[id]/registration
 * 取消活動報名
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user identity
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: 'Unauthorized access' 
      }, { status: 401 })
    }

    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid event ID' },
        { status: 400 }
      )
    }

    // 檢查活動是否存在
    const event = await prisma.event.findFirst({
      where: { 
        id: eventId,
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        registrationDeadline: true
      }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event does not exist or is not published' },
        { status: 404 }
      )
    }

    // Check registration deadline（通常取消也要在期限內）
    if (event.registrationDeadline && new Date(event.registrationDeadline) <= new Date()) {
      return NextResponse.json(
        { success: false, message: '已超過取消報名期限' },
        { status: 400 }
      )
    }

    // 查找用戶的報名記錄
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: currentUser.id
        }
      }
    })

    if (!registration || registration.status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: '您尚未報名此活動' },
        { status: 400 }
      )
    }

    // 更新報名狀態為已取消
    await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: { 
        status: 'cancelled',
        updatedAt: new Date()
      }
    })

    // 如果原本是確認狀態，檢查候補名單
    if (registration.status === 'confirmed') {
      const waitingListRegistration = await prisma.eventRegistration.findFirst({
        where: {
          eventId,
          status: 'waiting_list'
        },
        orderBy: {
          registeredAt: 'asc'
        }
      })

      // 將候補名單第一人移至確認狀態
      if (waitingListRegistration) {
        await prisma.eventRegistration.update({
          where: { id: waitingListRegistration.id },
          data: { status: 'confirmed' }
        })

        // 發送候補轉正通知
        await prisma.eventNotification.create({
          data: {
            eventId,
            type: 'registration_confirmed',
            recipientType: 'specific_users',
            title: `候補轉正：${event.title}`,
            message: `好消息！您已從候補名單轉為正式報名 ${event.title}。期待您的參與！`,
            recipientCount: 1,
            createdBy: currentUser.id
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: '報名已取消'
    })

  } catch (error) {
    console.error('Cancel registration error:', error)
    return NextResponse.json(
      { success: false, message: '取消報名失敗' },
      { status: 500 }
    )
  }
}