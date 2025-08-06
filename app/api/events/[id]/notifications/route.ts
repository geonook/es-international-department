import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AUTH_ERRORS, isAdmin } from '@/lib/auth'
import { EventNotificationType, NotificationRecipientType } from '@/lib/types'

/**
 * Event Notifications API - /api/events/[id]/notifications
 * 活動通知 API
 * 
 * @description 處理活動通知相關操作
 * @features 發送通知、查詢通知歷史、預約通知
 * @author Claude Code | Generated for ES International Department
 */

/**
 * GET /api/events/[id]/notifications
 * 獲取活動通知列表（僅管理員）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證管理員權限
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: '未授權訪問' 
      }, { status: 401 })
    }

    if (!isAdmin(currentUser)) {
      return NextResponse.json({ 
        success: false, 
        error: AUTH_ERRORS.ACCESS_DENIED,
        message: '權限不足' 
      }, { status: 403 })
    }

    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: '無效的活動ID' },
        { status: 400 }
      )
    }

    // 檢查活動是否存在
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, message: '活動不存在' },
        { status: 404 }
      )
    }

    // 解析查詢參數
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // 構建篩選條件
    const where: any = { eventId }

    if (status && status !== 'all') {
      where.status = status
    }

    if (type && type !== 'all') {
      where.type = type
    }

    // 計算總數和分頁
    const totalCount = await prisma.eventNotification.count({ where })
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    // 獲取通知列表
    const notifications = await prisma.eventNotification.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    // 構建分頁資訊
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
      data: notifications,
      pagination,
      event
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { success: false, message: '獲取通知列表失敗' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/events/[id]/notifications
 * 建立並發送活動通知（僅管理員）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證管理員權限
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: '未授權訪問' 
      }, { status: 401 })
    }

    if (!isAdmin(currentUser)) {
      return NextResponse.json({ 
        success: false, 
        error: AUTH_ERRORS.ACCESS_DENIED,
        message: '權限不足' 
      }, { status: 403 })
    }

    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: '無效的活動ID' },
        { status: 400 }
      )
    }

    // 解析請求資料
    const data = await request.json()
    const {
      type,
      recipientType,
      title,
      message,
      scheduledFor,
      targetGrades,
      specificUserIds
    } = data

    // 驗證必填欄位
    if (!type || !recipientType || !title || !message) {
      return NextResponse.json(
        { success: false, message: '缺少必填欄位' },
        { status: 400 }
      )
    }

    // 檢查活動是否存在
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          where: {
            status: 'confirmed'
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true
              }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, message: '活動不存在' },
        { status: 404 }
      )
    }

    // 計算接收者數量
    let recipientCount = 0
    let recipients: string[] = []

    switch (recipientType) {
      case 'all_registered':
        recipients = event.registrations.map(reg => reg.userId)
        recipientCount = recipients.length
        break
      
      case 'specific_users':
        if (specificUserIds && Array.isArray(specificUserIds)) {
          recipients = specificUserIds
          recipientCount = specificUserIds.length
        }
        break
      
      case 'target_audience':
        // 根據活動的目標對象發送
        if (event.targetGrades && Array.isArray(event.targetGrades)) {
          const users = await prisma.user.findMany({
            where: {
              isActive: true,
              // 這裡需要根據實際的用戶-年級關聯邏輯來篩選
              // 暫時發送給所有活躍用戶
            },
            select: { id: true }
          })
          recipients = users.map(user => user.id)
          recipientCount = recipients.length
        }
        break
      
      case 'grade_level':
        if (targetGrades && Array.isArray(targetGrades)) {
          // 根據指定年級發送
          const users = await prisma.user.findMany({
            where: {
              isActive: true,
              // 這裡需要根據實際的用戶-年級關聯邏輯來篩選
            },
            select: { id: true }
          })
          recipients = users.map(user => user.id)
          recipientCount = recipients.length
        }
        break
    }

    // 建立通知記錄
    const notification = await prisma.eventNotification.create({
      data: {
        eventId,
        type: type as EventNotificationType,
        recipientType: recipientType as NotificationRecipientType,
        title,
        message,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        recipientCount,
        createdBy: currentUser.id
      }
    })

    // 如果是立即發送，則處理通知發送
    if (!scheduledFor) {
      try {
        // 為每個接收者建立個人通知記錄
        const personalNotifications = recipients.map(userId => ({
          recipientId: userId,
          title,
          message,
          type: type === 'registration_confirmed' ? 'event' : 'system',
          relatedId: eventId,
          relatedType: 'event'
        }))

        if (personalNotifications.length > 0) {
          await prisma.notification.createMany({
            data: personalNotifications
          })

          // 更新通知狀態為已發送
          await prisma.eventNotification.update({
            where: { id: notification.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
              deliveredCount: personalNotifications.length
            }
          })
        }

        return NextResponse.json({
          success: true,
          message: `通知已發送給 ${personalNotifications.length} 位用戶`,
          data: {
            ...notification,
            status: 'sent',
            sentAt: new Date(),
            deliveredCount: personalNotifications.length
          }
        })

      } catch (sendError) {
        console.error('Send notification error:', sendError)
        
        // 更新通知狀態為失敗
        await prisma.eventNotification.update({
          where: { id: notification.id },
          data: {
            status: 'failed',
            errorMessage: 'Failed to send notifications'
          }
        })

        return NextResponse.json({
          success: false,
          message: '通知建立成功但發送失敗',
          data: notification
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: scheduledFor ? '通知已預約發送' : '通知建立成功',
      data: notification
    })

  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { success: false, message: '建立通知失敗' },
      { status: 500 }
    )
  }
}