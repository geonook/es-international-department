import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'
import NotificationService from '@/lib/notificationService'
import { NotificationPreferences } from '@/lib/types'

/**
 * Notification Preferences API - /api/notifications/preferences
 * 通知偏好設定 API
 * 
 * @description 處理用戶通知偏好設定的獲取和更新
 * @features 通知偏好獲取、更新、重置為預設值
 * @author Claude Code | Generated for ES International Department
 */

/**
 * GET /api/notifications/preferences
 * 獲取用戶通知偏好設定
 */
export async function GET(request: NextRequest) {
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

    // 獲取用戶通知偏好
    const preferences = await NotificationService.getUserPreferences(userId)

    return NextResponse.json({
      success: true,
      data: preferences
    })

  } catch (error) {
    console.error('Get notification preferences error:', error)
    return NextResponse.json(
      { success: false, message: '獲取通知偏好失敗' },
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
    // 驗證用戶身份
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: '未授權訪問' }, 
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
    // 驗證用戶身份
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: '未授權訪問' }, 
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