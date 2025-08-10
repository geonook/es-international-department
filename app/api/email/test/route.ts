/**
 * Email Testing API Endpoint
 * Email Testing API Endpoint
 * 
 * @description Tests email service functionality including connection and template testing
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { NextRequest, NextResponse } from 'next/server'
import emailService from '@/lib/emailService'
import templateEngine from '@/lib/emailTemplateEngine'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // 驗證身份（僅管理員可測試）
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 })
    }

    const user = await verifyAuth(token)
    if (!user) {
      return NextResponse.json({ error: '無效的身份驗證' }, { status: 401 })
    }

    // 檢查管理員權限
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true }
    })

    const isAdmin = userRoles.some(ur => ur.role.name === 'admin')
    if (!isAdmin) {
      return NextResponse.json({ error: '需要管理員權限' }, { status: 403 })
    }

    const requestData = await request.json()
    const { testType, recipient, templateType, templateData } = requestData

    switch (testType) {
      case 'connection':
        return await testConnection()
      
      case 'template':
        return await testTemplate(templateType, templateData || {})
      
      case 'send':
        return await testSendEmail(recipient, templateType, templateData || {})
      
      case 'queue':
        return await testQueue()
      
      default:
        return NextResponse.json({ 
          error: `不支持的測試類型: ${testType}` 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('郵件測試API錯誤:', error)
    return NextResponse.json({ 
      error: '測試失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}

/**
 * 測試郵件服務連接
 */
async function testConnection() {
  try {
    const connectionResult = await emailService.testConnection()
    const queueStats = emailService.getQueueStats()

    return NextResponse.json({
      success: true,
      message: '連接測試完成',
      results: {
        connection: {
          status: connectionResult ? 'connected' : 'failed',
          message: connectionResult ? '郵件服務連接正常' : '郵件服務連接失敗',
          timestamp: new Date().toISOString()
        },
        queue: {
          ...queueStats,
          message: '佇列狀態正常'
        },
        configuration: {
          provider: process.env.EMAIL_PROVIDER || 'smtp',
          host: process.env.EMAIL_HOST || 'not configured',
          testMode: process.env.EMAIL_TEST_MODE === 'true',
          queueEnabled: process.env.EMAIL_QUEUE_ENABLED === 'true'
        }
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '連接測試失敗'
    }, { status: 500 })
  }
}

/**
 * 測試郵件模板
 */
async function testTemplate(templateType: string, templateData: any) {
  try {
    // 準備測試數據
    const testData = {
      userName: '測試用戶',
      title: '測試公告標題',
      content: '這是一封測試郵件內容，用於驗證模板渲染功能。',
      eventTitle: '測試活動',
      eventDate: new Date(),
      priority: 'medium',
      ...templateData
    }

    // 渲染模板
    const rendered = await templateEngine.render(templateType as any, testData, {
      language: 'zh-TW',
      theme: 'default',
      includeUnsubscribe: false
    })

    return NextResponse.json({
      success: true,
      message: '模板測試完成',
      results: {
        templateType,
        rendered: {
          subject: rendered.subject,
          htmlPreview: rendered.html.substring(0, 500) + '...',
          textPreview: rendered.text.substring(0, 200) + '...',
          fullHtmlLength: rendered.html.length,
          fullTextLength: rendered.text.length
        },
        templateData: testData,
        renderTime: new Date().toISOString()
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '模板測試失敗'
    }, { status: 500 })
  }
}

/**
 * 測試發送郵件
 */
async function testSendEmail(recipient: string, templateType: string, templateData: any) {
  try {
    if (!recipient) {
      recipient = process.env.EMAIL_TEST_RECIPIENT || 'test@example.com'
    }

    // 準備測試數據
    const testData = {
      userName: '測試用戶',
      title: '【測試】KCISLK ESID 郵件服務測試',
      content: '這是一封測試郵件，用於驗證郵件發送功能。如果您收到此郵件，表示郵件服務工作正常。',
      eventTitle: '測試活動',
      eventDate: new Date(),
      priority: 'medium',
      testInfo: {
        timestamp: new Date().toISOString(),
        templateType,
        environment: process.env.NODE_ENV || 'development'
      },
      ...templateData
    }

    // 發送測試郵件
    let success = false
    let details = {}

    switch (templateType) {
      case 'welcome':
        success = await emailService.sendWelcomeEmail(recipient, testData.userName)
        break
      
      case 'announcement':
        const announcementResult = await emailService.sendAnnouncementEmail(
          [recipient],
          testData.title,
          testData.content,
          testData.priority as any
        )
        success = announcementResult.success
        details = announcementResult
        break
      
      case 'test':
      default:
        success = await emailService.sendTestEmail(recipient)
        break
    }

    return NextResponse.json({
      success,
      message: success ? '測試郵件發送成功' : '測試郵件發送失敗',
      results: {
        recipient,
        templateType,
        templateData: testData,
        sendTime: new Date().toISOString(),
        details
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '郵件發送測試失敗'
    }, { status: 500 })
  }
}

/**
 * 測試佇列系統
 */
async function testQueue() {
  try {
    const queueStats = emailService.getQueueStats()
    
    // 添加幾封測試郵件到佇列
    const testRecipient = process.env.EMAIL_TEST_RECIPIENT || 'test@example.com'
    const testEmails = [
      {
        to: testRecipient,
        subject: '【佇列測試】高優先級測試郵件',
        html: '<h1>高優先級測試郵件</h1><p>這是佇列系統測試郵件。</p>',
        text: '高優先級測試郵件 - 這是佇列系統測試郵件。'
      },
      {
        to: testRecipient,
        subject: '【佇列測試】普通優先級測試郵件',
        html: '<h1>普通優先級測試郵件</h1><p>這是佇列系統測試郵件。</p>',
        text: '普通優先級測試郵件 - 這是佇列系統測試郵件。'
      }
    ]

    const bulkResult = await emailService.sendBulkEmails(testEmails, 'normal')
    
    // 等待一秒後獲取更新的佇列狀態
    await new Promise(resolve => setTimeout(resolve, 1000))
    const updatedStats = emailService.getQueueStats()

    return NextResponse.json({
      success: true,
      message: '佇列測試完成',
      results: {
        initialStats: queueStats,
        bulkSendResult: bulkResult,
        updatedStats: updatedStats,
        testEmails: testEmails.length,
        testTime: new Date().toISOString()
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '佇列測試失敗'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // 獲取測試概覽信息
    const connectionStatus = await emailService.testConnection()
    const queueStats = emailService.getQueueStats()
    const availableTemplates = templateEngine.getAvailableTemplates()

    return NextResponse.json({
      status: 'operational',
      testEndpoint: '/api/email/test',
      availableTests: [
        {
          type: 'connection',
          description: '測試郵件服務連接',
          method: 'POST',
          body: { testType: 'connection' }
        },
        {
          type: 'template',
          description: '測試郵件模板渲染',
          method: 'POST',
          body: { testType: 'template', templateType: 'welcome', templateData: {} }
        },
        {
          type: 'send',
          description: '測試發送郵件',
          method: 'POST',
          body: { testType: 'send', recipient: 'test@example.com', templateType: 'test' }
        },
        {
          type: 'queue',
          description: '測試佇列系統',
          method: 'POST',
          body: { testType: 'queue' }
        }
      ],
      currentStatus: {
        connection: connectionStatus,
        queue: queueStats,
        templatesAvailable: availableTemplates.length
      },
      configuration: {
        provider: process.env.EMAIL_PROVIDER || 'smtp',
        testMode: process.env.EMAIL_TEST_MODE === 'true',
        queueEnabled: process.env.EMAIL_QUEUE_ENABLED === 'true',
        testRecipient: process.env.EMAIL_TEST_RECIPIENT || 'not configured'
      }
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}