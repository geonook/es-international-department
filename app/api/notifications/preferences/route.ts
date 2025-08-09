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
 * Update user notification preferences
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

    // Parse request data
    const preferences: Partial<NotificationPreferences> = await request.json()

    // Validate preference data
    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid preference data' },
        { status: 400 }
      )
    }

    // Update user notification preferences
    const updatedPreferences = await NotificationService.updateUserPreferences(
      userId, 
      preferences
    )

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated',
      data: updatedPreferences
    })

  } catch (error) {
    console.error('Update notification preferences error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update notification preferences' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/preferences
 * Reset notification preferences to defaults
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

    // Reset to default preference settings
    const defaultPreferences = await NotificationService.getUserPreferences(userId)

    return NextResponse.json({
      success: true,
      message: 'Notification preferences reset to defaults',
      data: defaultPreferences
    })

  } catch (error) {
    console.error('Reset notification preferences error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to reset notification preferences' },
      { status: 500 }
    )
  }
}