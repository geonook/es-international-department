import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'
import { calculateStats } from '../route'

/**
 * Notification Statistics API - /api/notifications/stats
 * 通知統計 API
 * 
 * @description 提供用戶通知統計資訊，包括未讀數量、類型分布等
 * @features 通知統計、未讀計數、類型分析、時間分析
 * @author Claude Code | Generated for ES International Department
 */

/**
 * GET /api/notifications/stats
 * 獲取用戶通知統計資訊
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

    // 計算統計資訊
    const stats = await calculateStats(userId)

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Get notification stats error:', error)
    return NextResponse.json(
      { success: false, message: '獲取通知統計失敗' },
      { status: 500 }
    )
  }
}