/**
 * Email Sending API Endpoint
 * Email Sending API Endpoint
 * 
 * @description Handles email sending requests, supports single and bulk sending
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import emailService from '@/lib/emailService'
import emailQueue from '@/lib/emailQueue'
import templateEngine from '@/lib/emailTemplateEngine'
import { getCurrentUser, isAdmin, AUTH_ERRORS } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Check user permissions (only admins and teachers can send emails)
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true }
    })

    const hasPermission = userRoles.some(ur => 
      ['admin', 'teacher'].includes(ur.role.name)
    )

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const requestData = await request.json()
    const { type, recipients, template, templateData, options = {} } = requestData

    // Validate required fields
    if (!type || !recipients || !template) {
      return NextResponse.json({ 
        error: 'Missing required fields: type, recipients, template' 
      }, { status: 400 })
    }

    // Validate recipients list
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ 
        error: 'Recipients list cannot be empty' 
      }, { status: 400 })
    }

    // Handle by sending type
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
          error: `Unsupported email type: ${type}` 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Email send API error:', error)
    return NextResponse.json({ 
      error: 'Email sending failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Handle single email sending
 */
async function handleSingleEmail(
  recipient: string,
  template: string,
  templateData: any,
  options: any
) {
  try {
    // Render template
    const rendered = await templateEngine.render(template, templateData, options)
    
    // Send email
    const success = await emailService.sendEmail({
      to: recipient,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text
    })

    return NextResponse.json({
      success,
      message: success ? 'Email sent successfully' : 'Email sending failed',
      recipient
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Send failed'
    }, { status: 500 })
  }
}

/**
 * Handle bulk email sending
 */
async function handleBulkEmail(
  recipients: string[],
  template: string,
  templateData: any,
  options: any
) {
  try {
    // Render template
    const rendered = await templateEngine.render(template, templateData, options)
    
    // Prepare bulk emails
    const emails = recipients.map(recipient => ({
      to: recipient,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text
    }))

    // Send bulk emails
    const result = await emailService.sendBulkEmails(emails, options.priority || 'normal')

    return NextResponse.json({
      success: result.success,
      message: 'Bulk email sending completed',
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
      error: error instanceof Error ? error.message : 'Bulk sending failed'
    }, { status: 500 })
  }
}

/**
 * Handle announcement email sending
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

    // Log to database
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
      message: 'Announcement email sending completed',
      details: result
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Announcement email sending failed'
    }, { status: 500 })
  }
}

/**
 * Handle event notification email sending
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

    // Log to database
    if (options.logToDatabase !== false) {
      await logEmailToDatabase('event_notification', {
        recipients: recipients.length,
        subject: `Event Notification: ${eventTitle}`,
        content: eventDetails,
        status: result.success ? 'sent' : 'failed',
        details: result
      })
    }

    return NextResponse.json({
      success: result.success,
      message: 'Event notification email sending completed',
      details: result
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Event notification email sending failed'
    }, { status: 500 })
  }
}

/**
 * Handle newsletter email sending
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

    // Log to database
    if (options.logToDatabase !== false) {
      await logEmailToDatabase('newsletter', {
        recipients: recipients.length,
        subject: `${title}${issueNumber ? ` - Issue ${issueNumber}` : ''}`,
        content,
        status: result.success ? 'sent' : 'failed',
        details: result
      })
    }

    return NextResponse.json({
      success: result.success,
      message: 'Newsletter email sending completed',
      details: result
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Newsletter email sending failed'
    }, { status: 500 })
  }
}

/**
 * Log email sending to database
 */
async function logEmailToDatabase(type: string, data: any) {
  try {
    // Create a dedicated email log table here
    // Or use existing notification table to record
    console.log('📧 Email log:', { type, ...data })
  } catch (error) {
    console.error('Failed to log email sending:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ 
        error: AUTH_ERRORS.TOKEN_REQUIRED,
        message: 'Unauthorized access' 
      }, { status: 401 })
    }

    // Get email service status
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