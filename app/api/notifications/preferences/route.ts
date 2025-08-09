import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'
import NotificationService from '@/lib/notificationService'
import { NotificationPreferences } from '@/lib/types'

/**
 * Notification Preferences API - /api/notifications/preferences
 * Notification Preferences API
 * 
 * @description Handle user notification preference retrieval and updates
 * @features Notification preference retrieval, updates, reset to defaults
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/notifications/preferences
 * Get user notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: 'Unauthorized access' }, 
        { status: 401 }
      )
    }

    const userId = currentUser.id

    // Get user notification preferences
    const preferences = await NotificationService.getUserPreferences(userId)

    return NextResponse.json({
      success: true,
      data: preferences
    })

  } catch (error) {
    console.error('Get notification preferences error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get notification preferences' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/notifications/preferences
 * 更新用戶通知偏好設定
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify user authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: 'Unauthorized access' }, 
        { status: 401 }
      )
    }

    const userId = currentUser.id

    // 解析請求資料
    const preferences: Partial<NotificationPreferences> = await request.json()

    // 驗證偏好設定資料
    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { success: false, message: '無效的偏好設定資料' },
        { status: 400 }
      )
    }

    // 更新用戶通知偏好
    const updatedPreferences = await NotificationService.updateUserPreferences(
      userId, 
      preferences
    )

    return NextResponse.json({
      success: true,
      message: '通知偏好已更新',
      data: updatedPreferences
    })

  } catch (error) {
    console.error('Update notification preferences error:', error)
    return NextResponse.json(
      { success: false, message: '更新通知偏好失敗' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/preferences
 * 重置通知偏好為預設值
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify user authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: 'Unauthorized access' }, 
        { status: 401 }
      )
    }

    const userId = currentUser.id

    // 重置為預設偏好設定
    const defaultPreferences = await NotificationService.getUserPreferences(userId)

    return NextResponse.json({
      success: true,
      message: '通知偏好已重置為預設值',
      data: defaultPreferences
    })

  } catch (error) {
    console.error('Reset notification preferences error:', error)
    return NextResponse.json(
      { success: false, message: '重置通知偏好失敗' },
      { status: 500 }
    )
  }
}