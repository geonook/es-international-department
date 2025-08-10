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
 * 獲取所有可用的通知模板（管理員功能）
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

    // 檢查管理員權限
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.ACCESS_DENIED, message: '權限不足' },
        { status: 403 }
      )
    }

    // 獲取所有通知模板
    const templates = NotificationService.getAllTemplates()

    // 解析查詢參數
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // 篩選模板
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

    // 按類別分組
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
      { success: false, message: '獲取通知模板失敗' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications/templates
 * 預覽通知模板（管理員功能）
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

    // 檢查管理員權限
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: AUTH_ERRORS.ACCESS_DENIED, message: '權限不足' },
        { status: 403 }
      )
    }

    // 解析請求資料
    const body = await request.json()
    const { templateId, variables } = body

    if (!templateId) {
      return NextResponse.json(
        { success: false, message: '缺少模板ID' },
        { status: 400 }
      )
    }

    // 獲取模板
    const template = NotificationService.getTemplate(templateId as NotificationTemplate)
    
    if (!template) {
      return NextResponse.json(
        { success: false, message: '模板不存在' },
        { status: 404 }
      )
    }

    // 應用變數生成預覽
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

    // 為未替換的變數提供預設值
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
      { success: false, message: '預覽通知模板失敗' },
      { status: 500 }
    )
  }
}