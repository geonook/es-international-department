/**
 * Email Sending API Endpoint
 * 電子郵件發送 API 端點
 * 
 * @description 處理電子郵件發送請求，支持單發和批量發送
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import emailService from '@/lib/emailService'
import emailQueue from '@/lib/emailQueue'
import templateEngine from '@/lib/emailTemplateEngine'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // 驗證身份
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 })
    }

    const user = await verifyAuth(token)
    if (!user) {
      return NextResponse.json({ error: '無效的身份驗證' }, { status: 401 })
    }

    // 檢查用戶權限（只有管理員和老師可以發送郵件）
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true }
    })

    const hasPermission = userRoles.some(ur => 
      ['admin', 'teacher'].includes(ur.role.name)
    )

    if (!hasPermission) {
      return NextResponse.json({ error: '權限不足' }, { status: 403 })
    }

    const requestData = await request.json()
    const { type, recipients, template, templateData, options = {} } = requestData

    // 驗證必需欄位
    if (!type || !recipients || !template) {
      return NextResponse.json({ 
        error: '缺少必需欄位: type, recipients, template' 
      }, { status: 400 })
    }

    // 驗證收件人列表
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ 
        error: '收件人列表不能為空' 
      }, { status: 400 })
    }

    // 根據發送類型處理
    switch (type) {
      case 'single':
        return await handleSingleEmail(recipients[0], template, templateData, options)
      
      case 'bulk':
        return await handleBulkEmail(recipients, template, templateData, options)
      
      case 'announcement':
        return await handleAnnouncementEmail(recipients, templateData, options)
      
      case 'event_notification':
        return await handleEventNotificationEmail(recipients, templateData, options)
      
      case 'newsletter':
        return await handleNewsletterEmail(recipients, templateData, options)
      
      default:
        return NextResponse.json({ 
          error: `不支持的郵件類型: ${type}` 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('郵件發送API錯誤:', error)
    return NextResponse.json({ 
      error: '郵件發送失败',
      details: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}

/**
 * 處理單一郵件發送
 */
async function handleSingleEmail(
  recipient: string,
  template: string,
  templateData: any,
  options: any
) {
  try {
    // 渲染模板
    const rendered = await templateEngine.render(template, templateData, options)
    
    // 發送郵件
    const success = await emailService.sendEmail({
      to: recipient,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text
    })

    return NextResponse.json({
      success,
      message: success ? '郵件發送成功' : '郵件發送失敗',
      recipient
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '發送失敗'
    }, { status: 500 })
  }
}

/**
 * 處理批量郵件發送
 */
async function handleBulkEmail(
  recipients: string[],
  template: string,
  templateData: any,
  options: any
) {
  try {
    // 渲染模板
    const rendered = await templateEngine.render(template, templateData, options)
    
    // 準備批量郵件
    const emails = recipients.map(recipient => ({
      to: recipient,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text
    }))

    // 發送批量郵件
    const result = await emailService.sendBulkEmails(emails, options.priority || 'normal')

    return NextResponse.json({
      success: result.success,
      message: `郵件批量發送完成`,
      totalRecipients: recipients.length,
      queueId: result.queueId,
      details: {
        totalSent: result.totalSent,
        totalFailed: result.totalFailed,
        failedEmails: result.failedEmails
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '批量發送失敗'
    }, { status: 500 })
  }
}

/**
 * 處理公告郵件發送
 */
async function handleAnnouncementEmail(
  recipients: string[],
  templateData: any,
  options: any
) {
  try {
    const { title, content, priority = 'medium' } = templateData

    const result = await emailService.sendAnnouncementEmail(
      recipients,
      title,
      content,
      priority
    )

    // 記錄到資料庫
    if (options.logToDatabase !== false) {
      await logEmailToDatabase('announcement', {
        recipients: recipients.length,
        subject: title,
        content,
        status: result.success ? 'sent' : 'failed',
        details: result
      })
    }

    return NextResponse.json({
      success: result.success,
      message: '公告郵件發送完成',
      details: result
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '公告郵件發送失敗'
    }, { status: 500 })
  }
}

/**
 * 處理活動通知郵件發送
 */
async function handleEventNotificationEmail(
  recipients: string[],
  templateData: any,
  options: any
) {
  try {
    const { eventTitle, eventDate, eventDetails } = templateData

    const result = await emailService.sendEventNotificationEmail(
      recipients,
      eventTitle,
      new Date(eventDate),
      eventDetails
    )

    // 記錄到資料庫
    if (options.logToDatabase !== false) {
      await logEmailToDatabase('event_notification', {
        recipients: recipients.length,
        subject: `活動通知：${eventTitle}`,
        content: eventDetails,
        status: result.success ? 'sent' : 'failed',
        details: result
      })
    }

    return NextResponse.json({
      success: result.success,
      message: '活動通知郵件發送完成',
      details: result
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '活動通知郵件發送失敗'
    }, { status: 500 })
  }
}

/**
 * 處理電子報郵件發送
 */
async function handleNewsletterEmail(
  recipients: string[],
  templateData: any,
  options: any
) {
  try {
    const { title, content, issueNumber } = templateData

    const result = await emailService.sendNewsletterEmail(
      recipients,
      title,
      content,
      issueNumber
    )

    // 記錄到資料庫
    if (options.logToDatabase !== false) {
      await logEmailToDatabase('newsletter', {
        recipients: recipients.length,
        subject: `${title}${issueNumber ? ` - 第${issueNumber}期` : ''}`,
        content,
        status: result.success ? 'sent' : 'failed',
        details: result
      })
    }

    return NextResponse.json({
      success: result.success,
      message: '電子報郵件發送完成',
      details: result
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '電子報郵件發送失敗'
    }, { status: 500 })
  }
}

/**
 * 記錄郵件發送到資料庫
 */
async function logEmailToDatabase(type: string, data: any) {
  try {
    // 這裡可以創建一個專門的郵件日誌表
    // 或者使用現有的通知表來記錄
    console.log('📧 Email log:', { type, ...data })
  } catch (error) {
    console.error('記錄郵件發送失敗:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    // 驗證身份
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 })
    }

    const user = await verifyAuth(token)
    if (!user) {
      return NextResponse.json({ error: '無效的身份驗證' }, { status: 401 })
    }

    // 獲取郵件服務狀態
    const connectionStatus = await emailService.testConnection()
    const queueStats = emailService.getQueueStats()
    const availableTemplates = templateEngine.getAvailableTemplates()

    return NextResponse.json({
      status: 'operational',
      connection: connectionStatus,
      queue: queueStats,
      templates: availableTemplates,
      server: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}