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
import { getCurrentUser, isAdmin as checkIsAdmin, AUTH_ERRORS } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user (only admins can test)
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: 'Unauthorized access' 
      }, { status: 401 })
    }

    // Check admin permissions
    const hasAdminAccess = await checkIsAdmin(user.id)
    if (!hasAdminAccess) {
      return NextResponse.json({ 
        error: AUTH_ERRORS.INSUFFICIENT_PERMISSIONS,
        message: 'Admin permissions required' 
      }, { status: 403 })
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
          error: `Unsupported test type: ${testType}` 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Email test API error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Test email service connection
 */
async function testConnection() {
  try {
    const connectionResult = await emailService.testConnection()
    const queueStats = emailService.getQueueStats()

    return NextResponse.json({
      success: true,
      message: 'Connection test completed',
      results: {
        connection: {
          status: connectionResult ? 'connected' : 'failed',
          message: connectionResult ? 'Email service connected successfully' : 'Email service connection failed',
          timestamp: new Date().toISOString()
        },
        queue: {
          ...queueStats,
          message: 'Queue status normal'
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
      error: error instanceof Error ? error.message : 'Connection test failed'
    }, { status: 500 })
  }
}

/**
 * Test email template
 */
async function testTemplate(templateType: string, templateData: any) {
  try {
    // 準備測試數據
    const testData = {
      userName: 'Test User',
      title: 'Test Announcement Title',
      content: 'This is test email content for verifying template rendering functionality.',
      eventTitle: 'Test Event',
      eventDate: new Date(),
      priority: 'medium',
      ...templateData
    }

    // Render template
    const rendered = await templateEngine.render(templateType as any, testData, {
      language: 'zh-TW',
      theme: 'default',
      includeUnsubscribe: false
    })

    return NextResponse.json({
      success: true,
      message: 'Template test completed',
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
      error: error instanceof Error ? error.message : 'Template test failed'
    }, { status: 500 })
  }
}

/**
 * Test sending email
 */
async function testSendEmail(recipient: string, templateType: string, templateData: any) {
  try {
    if (!recipient) {
      recipient = process.env.EMAIL_TEST_RECIPIENT || 'test@example.com'
    }

    // 準備測試數據
    const testData = {
      userName: 'Test User',
      title: '[TEST] KCISLK ESID Email Service Test',
      content: 'This is a test email to verify email sending functionality. If you receive this email, the email service is working properly.',
      eventTitle: 'Test Event',
      eventDate: new Date(),
      priority: 'medium',
      testInfo: {
        timestamp: new Date().toISOString(),
        templateType,
        environment: process.env.NODE_ENV || 'development'
      },
      ...templateData
    }

    // Send test email
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
      message: success ? 'Test email sent successfully' : 'Test email sending failed',
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
      error: error instanceof Error ? error.message : 'Email sending test failed'
    }, { status: 500 })
  }
}

/**
 * Test queue system
 */
async function testQueue() {
  try {
    const queueStats = emailService.getQueueStats()
    
    // Add several test emails to queue
    const testRecipient = process.env.EMAIL_TEST_RECIPIENT || 'test@example.com'
    const testEmails = [
      {
        to: testRecipient,
        subject: '[Queue Test] High Priority Test Email',
        html: '<h1>High Priority Test Email</h1><p>This is a queue system test email.</p>',
        text: 'High Priority Test Email - This is a queue system test email.'
      },
      {
        to: testRecipient,
        subject: '[Queue Test] Normal Priority Test Email',
        html: '<h1>Normal Priority Test Email</h1><p>This is a queue system test email.</p>',
        text: 'Normal Priority Test Email - This is a queue system test email.'
      }
    ]

    const bulkResult = await emailService.sendBulkEmails(testEmails, 'normal')
    
    // Wait one second then get updated queue status
    await new Promise(resolve => setTimeout(resolve, 1000))
    const updatedStats = emailService.getQueueStats()

    return NextResponse.json({
      success: true,
      message: 'Queue test completed',
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
      error: error instanceof Error ? error.message : 'Queue test failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get test overview information
    const connectionStatus = await emailService.testConnection()
    const queueStats = emailService.getQueueStats()
    const availableTemplates = templateEngine.getAvailableTemplates()

    return NextResponse.json({
      status: 'operational',
      testEndpoint: '/api/email/test',
      availableTests: [
        {
          type: 'connection',
          description: 'Test email service connection',
          method: 'POST',
          body: { testType: 'connection' }
        },
        {
          type: 'template',
          description: 'Test email template rendering',
          method: 'POST',
          body: { testType: 'template', templateType: 'welcome', templateData: {} }
        },
        {
          type: 'send',
          description: 'Test sending email',
          method: 'POST',
          body: { testType: 'send', recipient: 'test@example.com', templateType: 'test' }
        },
        {
          type: 'queue',
          description: 'Test queue system',
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
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}