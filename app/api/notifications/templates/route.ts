import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, AUTH_ERRORS, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import NotificationService from '@/lib/notificationService'
import { NotificationTemplate } from '@/lib/types'

/**
 * Notification Templates API - /api/notifications/templates
 * Notification Templates API
 * 
 * @description Handles notification template retrieval and management (admin function)
 * @features Template list, template details, template variables
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

/**
 * GET /api/notifications/templates
 * Get all available notification templates (admin function)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user identity
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: 'Unauthorized access' }, 
        { status: 401 }
      )
    }

    // Check admin permissions
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.ACCESS_DENIED, message: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get all notification templates
    const templates = NotificationService.getAllTemplates()

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // Filter templates
    let filteredTemplates = templates

    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(
        template => template.category === category
      )
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredTemplates = filteredTemplates.filter(
        template => 
          template.name.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower)
      )
    }

    // Group by category
    const groupedTemplates = filteredTemplates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = []
      }
      acc[template.category].push(template)
      return acc
    }, {} as Record<string, typeof templates>)

    return NextResponse.json({
      success: true,
      data: {
        templates: filteredTemplates,
        groupedTemplates,
        totalCount: filteredTemplates.length,
        categories: Object.keys(groupedTemplates)
      }
    })

  } catch (error) {
    console.error('Get notification templates error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get notification templates' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications/templates
 * Preview notification template (admin function)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user identity
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.TOKEN_REQUIRED, message: 'Unauthorized access' }, 
        { status: 401 }
      )
    }

    // Check admin permissions
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.ACCESS_DENIED, message: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse request data
    const body = await request.json()
    const { templateId, variables } = body

    if (!templateId) {
      return NextResponse.json(
        { success: false, message: 'Missing template ID' },
        { status: 400 }
      )
    }

    // Get template
    const template = NotificationService.getTemplate(templateId as NotificationTemplate)
    
    if (!template) {
      return NextResponse.json(
        { success: false, message: 'Template does not exist' },
        { status: 404 }
      )
    }

    // Apply variables to generate preview
    let previewSubject = template.subject
    let previewBody = template.body

    if (variables && typeof variables === 'object') {
      Object.keys(variables).forEach(key => {
        const value = variables[key]
        if (typeof value === 'string' || typeof value === 'number') {
          const regex = new RegExp(`{{${key}}}`, 'g')
          previewSubject = previewSubject.replace(regex, String(value))
          previewBody = previewBody.replace(regex, String(value))
        }
      })
    }

    // Provide default values for unreplaced variables
    template.variables.forEach(variable => {
      const regex = new RegExp(`{{${variable}}}`, 'g')
      previewSubject = previewSubject.replace(regex, `[${variable}]`)
      previewBody = previewBody.replace(regex, `[${variable}]`)
    })

    return NextResponse.json({
      success: true,
      data: {
        template,
        preview: {
          subject: previewSubject,
          body: previewBody
        },
        variables: variables || {}
      }
    })

  } catch (error) {
    console.error('Preview notification template error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to preview notification template' },
      { status: 500 }
    )
  }
}