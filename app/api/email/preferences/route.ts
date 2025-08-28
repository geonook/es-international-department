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

    // Parse category preferences
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
    console.error('Failed to get email preferences:', error)
    return NextResponse.json({
      error: 'Failed to get preference settings',
      details: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: 'Unauthorized access' 
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

    // Validate do not disturb time format
    if (doNotDisturbEnabled && (doNotDisturbStart || doNotDisturbEnd)) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (doNotDisturbStart && !timeRegex.test(doNotDisturbStart)) {
        return NextResponse.json({
          error: 'Do not disturb start time format is invalid, should be HH:MM format'
        }, { status: 400 })
      }
      if (doNotDisturbEnd && !timeRegex.test(doNotDisturbEnd)) {
        return NextResponse.json({
          error: 'Do not disturb end time format is invalid, should be HH:MM format'
        }, { status: 400 })
      }
    }

    // Update or create preference settings
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
      message: 'Preference settings updated successfully',
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
    console.error('Failed to update email preferences:', error)
    return NextResponse.json({
      error: 'Failed to update preference settings',
      details: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: 'Unauthorized access' 
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
          error: `Unsupported operation: ${action}`
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Email preferences operation failed:', error)
    return NextResponse.json({
      error: 'Operation failed',
      details: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}

/**
 * Toggle category preference
 */
async function toggleCategoryPreference(userId: string, category: string, enabled: boolean) {
  try {
    // Get existing preferences
    const existing = await prisma.notificationPreference.findUnique({
      where: { userId }
    })

    let categoryPreferences = {}
    if (existing && typeof existing.categoryPreferences === 'object') {
      categoryPreferences = { ...existing.categoryPreferences as any }
    }

    // Update specific category
    (categoryPreferences as any)[category] = enabled

    // Save update
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
      message: `${category} preference ${enabled ? 'enabled' : 'disabled'}`,
      categoryPreferences: preferences.categoryPreferences
    })

  } catch (error) {
    throw error
  }
}

/**
 * Reset to default settings
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
      message: 'Preference settings have been reset to default values',
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
 * Bulk update category settings
 */
async function bulkUpdateCategories(userId: string, categories: Record<string, boolean>) {
  try {
    // Get existing preferences
    const existing = await prisma.notificationPreference.findUnique({
      where: { userId }
    })

    let categoryPreferences = {}
    if (existing && typeof existing.categoryPreferences === 'object') {
      categoryPreferences = { ...existing.categoryPreferences as any }
    }

    // Bulk update categories
    Object.entries(categories).forEach(([category, enabled]) => {
      (categoryPreferences as any)[category] = enabled
    })

    // Save update
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
      message: 'Category preferences bulk updated successfully',
      updatedCategories: Object.keys(categories),
      categoryPreferences: preferences.categoryPreferences
    })

  } catch (error) {
    throw error
  }
}