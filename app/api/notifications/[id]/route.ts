import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'

/**
 * Individual Notification API - /api/notifications/[id]
 * 個別通知 API
 * 
 * @description 處理單一通知的獲取、標記已讀、刪除等操作
 * @features 通知詳情、標記已讀、刪除通知
 * @author Claude Code | Generated for ES International Department
 */

/**
 * GET /api/notifications/[id]
 * 獲取單一通知詳情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證用戶身份
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: '未授權訪問' }, 
        { status: 401 }
      )
    }

    const notificationId = parseInt(params.id)
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { success: false, message: '無效的通知ID' },
        { status: 400 }
      )
    }

    // 獲取通知詳情
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientId: currentUser.id
      },
      include: {
        recipient: {
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

    if (!notification) {
      return NextResponse.json(
        { success: false, message: '通知不存在' },
        { status: 404 }
      )
    }

    // 檢查是否過期
    const isExpired = notification.expiresAt && notification.expiresAt < new Date()
    if (isExpired) {
      return NextResponse.json(
        { success: false, message: '通知已過期' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      success: true,
      data: notification
    })

  } catch (error) {
    console.error('Get notification error:', error)
    return NextResponse.json(
      { success: false, message: '獲取通知失敗' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications/[id]
 * 更新通知狀態（標記已讀/未讀）
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證用戶身份
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: '未授權訪問' }, 
        { status: 401 }
      )
    }

    const notificationId = parseInt(params.id)
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { success: false, message: '無效的通知ID' },
        { status: 400 }
      )
    }

    // 解析請求資料
    const body = await request.json()
    const { action } = body

    if (!action || !['mark_read', 'mark_unread'].includes(action)) {
      return NextResponse.json(
        { success: false, message: '無效的操作' },
        { status: 400 }
      )
    }

    // 檢查通知是否存在且屬於當前用戶
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientId: currentUser.id
      }
    })

    if (!existingNotification) {
      return NextResponse.json(
        { success: false, message: '通知不存在' },
        { status: 404 }
      )
    }

    // 更新通知狀態
    const updateData: any = {}
    
    if (action === 'mark_read') {
      updateData.isRead = true
      updateData.readAt = new Date()
    } else if (action === 'mark_unread') {
      updateData.isRead = false
      updateData.readAt = null
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: updateData,
      include: {
        recipient: {
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
      message: action === 'mark_read' ? '已標記為已讀' : '已標記為未讀',
      data: updatedNotification
    })

  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json(
      { success: false, message: '更新通知失敗' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/[id]
 * 刪除通知
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證用戶身份
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: '未授權訪問' }, 
        { status: 401 }
      )
    }

    const notificationId = parseInt(params.id)
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { success: false, message: '無效的通知ID' },
        { status: 400 }
      )
    }

    // 檢查通知是否存在且屬於當前用戶
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientId: currentUser.id
      }
    })

    if (!existingNotification) {
      return NextResponse.json(
        { success: false, message: '通知不存在' },
        { status: 404 }
      )
    }

    // 刪除通知
    await prisma.notification.delete({
      where: { id: notificationId }
    })

    return NextResponse.json({
      success: true,
      message: '通知已刪除'
    })

  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json(
      { success: false, message: '刪除通知失敗' },
      { status: 500 }
    )
  }
}