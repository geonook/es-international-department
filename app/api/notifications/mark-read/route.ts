import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AUTH_ERRORS, isAdmin } from '@/lib/auth'
import NotificationService from '@/lib/notificationService'
import { BulkNotificationOperation } from '@/lib/types'

/**
 * Bulk Notification Operations API - /api/notifications/mark-read
 * 批量通知操作 API
 * 
 * @description 處理批量通知操作，如全部標記已讀、批量刪除等
 * @features 全部標記已讀、批量操作、清理過期通知
 * @author Claude Code | Generated for ES International Department
 */

/**
 * POST /api/notifications/mark-read
 * 批量標記通知為已讀
 */
export async function POST(request: NextRequest) {
  try {
    // 驗證用戶身份
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: '未授權訪問' }, 
        { status: 401 }
      )
    }

    const userId = currentUser.id
    const body = await request.json()
    const { action, notificationIds, markAll } = body

    if (markAll) {
      // 標記所有未讀通知為已讀
      const result = await prisma.notification.updateMany({
        where: {
          recipientId: userId,
          isRead: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: `已標記 ${result.count} 則通知為已讀`,
        data: { affectedCount: result.count }
      })
    }

    // 驗證批量操作資料
    if (!action || !notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { success: false, message: '無效的請求資料' },
        { status: 400 }
      )
    }

    if (notificationIds.length === 0) {
      return NextResponse.json(
        { success: false, message: '未選擇任何通知' },
        { status: 400 }
      )
    }

    if (notificationIds.length > 100) {
      return NextResponse.json(
        { success: false, message: '批量操作限制為100個通知' },
        { status: 400 }
      )
    }

    // 執行批量操作
    const operation: BulkNotificationOperation = {
      action,
      notificationIds
    }

    const result = await NotificationService.bulkOperation(userId, operation)

    if (result.success) {
      let message = ''
      switch (action) {
        case 'mark_read':
          message = `已標記 ${result.affectedCount} 則通知為已讀`
          break
        case 'mark_unread':
          message = `已標記 ${result.affectedCount} 則通知為未讀`
          break
        case 'archive':
          message = `已封存 ${result.affectedCount} 則通知`
          break
        case 'delete':
          message = `已刪除 ${result.affectedCount} 則通知`
          break
        default:
          message = `操作完成，影響 ${result.affectedCount} 則通知`
      }

      return NextResponse.json({
        success: true,
        message,
        data: result
      })
    } else {
      return NextResponse.json({
        success: false,
        message: '批量操作失敗',
        data: result
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Bulk notification operation error:', error)
    return NextResponse.json(
      { success: false, message: '批量操作失敗' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/mark-read
 * 清理過期通知（管理員功能）
 */
export async function DELETE(request: NextRequest) {
  try {
    // 驗證用戶身份
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: '未授權訪問' }, 
        { status: 401 }
      )
    }

    // 檢查管理員權限
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.ACCESS_DENIED, message: '權限不足' },
        { status: 403 }
      )
    }

    // 清理過期通知
    const cleanedCount = await NotificationService.cleanupExpiredNotifications()

    return NextResponse.json({
      success: true,
      message: `已清理 ${cleanedCount} 則過期通知`,
      data: { cleanedCount }
    })

  } catch (error) {
    console.error('Cleanup expired notifications error:', error)
    return NextResponse.json(
      { success: false, message: '清理過期通知失敗' },
      { status: 500 }
    )
  }
}