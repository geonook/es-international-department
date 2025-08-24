/**
 * Email Preferences API Endpoint
 * Email Preferences API Endpoint
 * 
 * @description Manages user email notification preferences
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, AUTH_ERRORS } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: 'Unauthorized access' 
      }, { status: 401 })
    }

    // Get user's notification preferences
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: user.id }
    })

    // If no preferences exist, return default values
    if (!preferences) {
      const defaultPreferences = {
        userId: user.id,
        email: true,
        system: true,
        browser: true,
        doNotDisturbEnabled: false,
        doNotDisturbStart: null,
        doNotDisturbEnd: null,
        categoryPreferences: {
          announcements: true,
          events: true,
          newsletters: true,
          reminders: true,
          system: true,
          digest: false
        }
      }

      return NextResponse.json({
        success: true,
        preferences: defaultPreferences
      })
    }

    // 解析分類偏好
    let categoryPreferences = {}
    if (typeof preferences.categoryPreferences === 'object') {
      categoryPreferences = preferences.categoryPreferences as any
    }

    return NextResponse.json({
      success: true,
      preferences: {
        userId: preferences.userId,
        email: preferences.email,
        system: preferences.system,
        browser: preferences.browser,
        doNotDisturbEnabled: preferences.doNotDisturbEnabled,
        doNotDisturbStart: preferences.doNotDisturbStart,
        doNotDisturbEnd: preferences.doNotDisturbEnd,
        categoryPreferences
      }
    })

  } catch (error) {
    console.error('獲取郵件偏好失敗:', error)
    return NextResponse.json({
      error: '獲取偏好設定失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 驗證身份
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: '未授權訪問' 
      }, { status: 401 })
    }

    const requestData = await request.json()
    const {
      email = true,
      system = true,
      browser = true,
      doNotDisturbEnabled = false,
      doNotDisturbStart,
      doNotDisturbEnd,
      categoryPreferences = {}
    } = requestData

    // 驗證免打擾時間格式
    if (doNotDisturbEnabled && (doNotDisturbStart || doNotDisturbEnd)) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (doNotDisturbStart && !timeRegex.test(doNotDisturbStart)) {
        return NextResponse.json({
          error: '免打擾開始時間格式無效，應為 HH:MM 格式'
        }, { status: 400 })
      }
      if (doNotDisturbEnd && !timeRegex.test(doNotDisturbEnd)) {
        return NextResponse.json({
          error: '免打擾結束時間格式無效，應為 HH:MM 格式'
        }, { status: 400 })
      }
    }

    // 更新或創建偏好設定
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        email,
        system,
        browser,
        doNotDisturbEnabled,
        doNotDisturbStart: doNotDisturbEnabled ? doNotDisturbStart : null,
        doNotDisturbEnd: doNotDisturbEnabled ? doNotDisturbEnd : null,
        categoryPreferences
      },
      update: {
        email,
        system,
        browser,
        doNotDisturbEnabled,
        doNotDisturbStart: doNotDisturbEnabled ? doNotDisturbStart : null,
        doNotDisturbEnd: doNotDisturbEnabled ? doNotDisturbEnd : null,
        categoryPreferences,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: '偏好設定更新成功',
      preferences: {
        userId: preferences.userId,
        email: preferences.email,
        system: preferences.system,
        browser: preferences.browser,
        doNotDisturbEnabled: preferences.doNotDisturbEnabled,
        doNotDisturbStart: preferences.doNotDisturbStart,
        doNotDisturbEnd: preferences.doNotDisturbEnd,
        categoryPreferences: preferences.categoryPreferences
      }
    })

  } catch (error) {
    console.error('更新郵件偏好失敗:', error)
    return NextResponse.json({
      error: '更新偏好設定失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 驗證身份
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: '未授權訪問' 
      }, { status: 401 })
    }

    const requestData = await request.json()
    const { action, category, enabled } = requestData

    switch (action) {
      case 'toggle_category':
        return await toggleCategoryPreference(user.id, category, enabled)
      
      case 'reset_defaults':
        return await resetToDefaults(user.id)
      
      case 'bulk_update':
        return await bulkUpdateCategories(user.id, requestData.categories)
      
      default:
        return NextResponse.json({
          error: `不支持的操作: ${action}`
        }, { status: 400 })
    }

  } catch (error) {
    console.error('郵件偏好操作失敗:', error)
    return NextResponse.json({
      error: '操作失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}

/**
 * 切換分類偏好
 */
async function toggleCategoryPreference(userId: string, category: string, enabled: boolean) {
  try {
    // 獲取現有偏好
    const existing = await prisma.notificationPreference.findUnique({
      where: { userId }
    })

    let categoryPreferences = {}
    if (existing && typeof existing.categoryPreferences === 'object') {
      categoryPreferences = { ...existing.categoryPreferences as any }
    }

    // 更新特定分類
    (categoryPreferences as any)[category] = enabled

    // 保存更新
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        email: true,
        system: true,
        browser: true,
        categoryPreferences
      },
      update: {
        categoryPreferences,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `${category} 偏好已${enabled ? '啟用' : '停用'}`,
      categoryPreferences: preferences.categoryPreferences
    })

  } catch (error) {
    throw error
  }
}

/**
 * 重置為默認設定
 */
async function resetToDefaults(userId: string) {
  try {
    const defaultPreferences = {
      email: true,
      system: true,
      browser: true,
      doNotDisturbEnabled: false,
      doNotDisturbStart: null,
      doNotDisturbEnd: null,
      categoryPreferences: {
        announcements: true,
        events: true,
        newsletters: true,
        reminders: true,
        system: true,
        digest: false
      }
    }

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...defaultPreferences
      },
      update: {
        ...defaultPreferences,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: '偏好設定已重置為默認值',
      preferences: {
        userId: preferences.userId,
        email: preferences.email,
        system: preferences.system,
        browser: preferences.browser,
        doNotDisturbEnabled: preferences.doNotDisturbEnabled,
        doNotDisturbStart: preferences.doNotDisturbStart,
        doNotDisturbEnd: preferences.doNotDisturbEnd,
        categoryPreferences: preferences.categoryPreferences
      }
    })

  } catch (error) {
    throw error
  }
}

/**
 * 批量更新分類設定
 */
async function bulkUpdateCategories(userId: string, categories: Record<string, boolean>) {
  try {
    // 獲取現有偏好
    const existing = await prisma.notificationPreference.findUnique({
      where: { userId }
    })

    let categoryPreferences = {}
    if (existing && typeof existing.categoryPreferences === 'object') {
      categoryPreferences = { ...existing.categoryPreferences as any }
    }

    // 批量更新分類
    Object.entries(categories).forEach(([category, enabled]) => {
      (categoryPreferences as any)[category] = enabled
    })

    // 保存更新
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        email: true,
        system: true,
        browser: true,
        categoryPreferences
      },
      update: {
        categoryPreferences,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: '分類偏好批量更新成功',
      updatedCategories: Object.keys(categories),
      categoryPreferences: preferences.categoryPreferences
    })

  } catch (error) {
    throw error
  }
}