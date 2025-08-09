/**
 * Enhanced Email Service for KCISLK ESID Info Hub
 * Enhanced Email Service Module
 * 
 * @description Handles email sending, template rendering, queue management and notification services
 * @features Email sending, template system, bulk sending, queue management, multi-SMTP support, error handling
 * @version 2.0.0
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import nodemailer, { Transporter } from 'nodemailer'
import { prisma } from './prisma'
import { env } from './env-validation'

// Email configuration interface
interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// Email content interface
interface EmailContent {
  to: string | string[]
  subject: string
  html: string
  text?: string
  cc?: string[]
  bcc?: string[]
}

// Email template types
export type EmailTemplateType = 
  | 'welcome'
  | 'announcement' 
  | 'event_notification'
  | 'event_reminder'
  | 'event_registration_confirmed'
  | 'password_reset'
  | 'newsletter'
  | 'system_notification'
  | 'digest'

// Template data interface
export interface TemplateData {
  [key: string]: any
}

// Bulk email results
export interface BulkEmailResult {
  success: boolean
  totalSent: number
  totalFailed: number
  failedEmails: string[]
  errors: string[]
  queueId?: string
}

// Email queue item
export interface EmailQueueItem {
  id: string
  to: string | string[]
  subject: string
  html: string
  text?: string
  template?: EmailTemplateType
  templateData?: TemplateData
  priority: 'low' | 'normal' | 'high'
  scheduledFor?: Date
  retryCount: number
  maxRetries: number
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
  errorMessage?: string
}

// Email provider configuration
export interface EmailProviderConfig {
  provider: 'smtp' | 'sendgrid' | 'aws-ses' | 'gmail'
  config: any
}

// Notification preferences
export interface NotificationPreferences {
  email: boolean
  emailDigest: boolean
  announcements: boolean
  events: boolean
  newsletters: boolean
  reminders: boolean
}

class EmailService {
  private transporter: Transporter | null = null
  private readonly fromAddress: string
  private readonly fromName: string
  private readonly provider: string
  private emailQueue: EmailQueueItem[] = []
  private isProcessingQueue = false
  private initialized = false
  private initializationPromise: Promise<void> | null = null
  private readonly rateLimits = {
    perMinute: env.RATE_LIMIT_MAX,
    perHour: env.RATE_LIMIT_MAX * 10  // 10x the per-minute limit for hourly
  }
  private sentCounts = { minute: 0, hour: 0, lastReset: { minute: Date.now(), hour: Date.now() } }

  constructor() {
    this.fromAddress = env.SYSTEM_EMAIL
    this.fromName = 'KCISLK ESID Info Hub'
    this.provider = env.EMAIL_PROVIDER
    
    // Delayed initialization - don't execute immediately in constructor
    // Will be initialized on first use
  }

  /**
   * Ensure email transporter is initialized (lazy initialization mode)
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return
    }

    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = this.initializeTransporter()
    return this.initializationPromise
  }

  /**
   * Initialize email transporter (supports multiple providers)
   */
  private async initializeTransporter(): Promise<void> {
    try {
      switch (this.provider) {
        case 'gmail':
          this.initializeGmailTransporter()
          break
        case 'sendgrid':
          this.initializeSendGridTransporter()
          break
        case 'aws-ses':
          await this.initializeAWSSESTransporter()
          break
        case 'smtp':
        default:
          this.initializeSMTPTransporter()
      }
      
      this.initialized = true
      this.startQueueProcessor()
      console.log(`✅ Email service initialized successfully with provider: ${this.provider}`)
    } catch (error) {
      console.warn(`⚠️ Email service initialization failed with provider ${this.provider}:`, error?.message || error)
      console.warn('⚠️ Email functionality may not work. Please configure email settings in environment variables.')
      // Set transporter to null to indicate email is not available
      this.transporter = null
      this.initialized = true // Mark as initialized even if failed to prevent retry loops
    }
  }

  private initializeSMTPTransporter() {
    const emailHost = process.env.EMAIL_HOST
    const emailUser = process.env.EMAIL_USER  
    const emailPass = process.env.EMAIL_PASS

    if (!emailHost || !emailUser || !emailPass) {
      throw new Error('SMTP configuration missing: EMAIL_HOST, EMAIL_USER, EMAIL_PASS required')
    }

    const config: EmailConfig = {
      host: emailHost,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: emailUser, pass: emailPass }
    }

    this.transporter = nodemailer.createTransporter(config)
  }

  private initializeGmailTransporter() {
    const user = process.env.EMAIL_USER
    const pass = process.env.EMAIL_PASS // App Password

    if (!user || !pass) {
      throw new Error('Gmail configuration missing: EMAIL_USER, EMAIL_PASS (App Password) required')
    }

    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: { user, pass }
    })
  }

  private initializeSendGridTransporter() {
    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      throw new Error('SendGrid configuration missing: SENDGRID_API_KEY required')
    }

    this.transporter = nodemailer.createTransporter({
      service: 'SendGrid',
      auth: { user: 'apikey', pass: apiKey }
    })
  }

  private async initializeAWSSESTransporter() {
    const region = env.awsSes.region
    const accessKeyId = env.awsSes.accessKeyId
    const secretAccessKey = env.awsSes.secretAccessKey

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error('AWS SES configuration missing: AWS_SES_REGION, AWS_SES_ACCESS_KEY_ID, AWS_SES_SECRET_ACCESS_KEY required')
    }

    try {
      // Dynamic import for AWS SDK - optional dependency with proper error handling
      const AWS = await this.loadAWSSDK()

      // Configure AWS credentials
      AWS.config.update({
        accessKeyId,
        secretAccessKey,
        region
      })

      this.transporter = nodemailer.createTransporter({
        SES: { aws: AWS, region }
      })
    } catch (error) {
      console.warn('⚠️ AWS SES initialization failed:', error.message)
      // Fallback to SMTP configuration if AWS SDK is not available
      console.warn('⚠️ Falling back to SMTP configuration...')
      try {
        this.initializeSMTPTransporter()
      } catch (smtpError) {
        throw new Error('Both AWS SES and SMTP configuration failed. Please configure at least one email provider.')
      }
    }
  }

  /**
   * Dynamically load AWS SDK with proper error handling
   * Dynamically load AWS SDK, avoid build warnings
   */
  private async loadAWSSDK(): Promise<any> {
    try {
      // Use dynamic import with explicit external marker
      const awsSDK = await import('aws-sdk').catch(() => {
        throw new Error('AWS SDK not available')
      })
      return awsSDK.default || awsSDK
    } catch (error) {
      console.warn('⚠️ AWS SDK not found. Falling back to SMTP configuration.')
      throw new Error('AWS SDK package not found. Please install aws-sdk package or use SMTP configuration instead.')
    }
  }

  /**
   * Send single email (supports rate limiting and test mode)
   */
  async sendEmail(emailContent: EmailContent): Promise<boolean> {
    // Ensure service is initialized
    await this.ensureInitialized()

    // Check test mode
    if (process.env.EMAIL_TEST_MODE === 'true') {
      console.log('⚠️ Email test mode enabled - email not sent:', emailContent.subject)
      return true
    }

    // Check rate limits
    if (!this.checkRateLimit()) {
      console.warn('⚠️ Email rate limit exceeded, queuing email:', emailContent.subject)
      await this.addToQueue({
        ...emailContent,
        priority: 'normal'
      })
      return true
    }

    if (!this.transporter) {
      console.error('❌ Email service not initialized or configuration invalid')
      return false
    }

    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromAddress}>`,
        to: Array.isArray(emailContent.to) ? emailContent.to.join(',') : emailContent.to,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        cc: emailContent.cc?.join(','),
        bcc: emailContent.bcc?.join(','),
      }

      const result = await this.transporter.sendMail(mailOptions)
      this.updateSentCounts()
      console.log('✅ Email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      return false
    }
  }

  /**
   * Check rate limits
   */
  private checkRateLimit(): boolean {
    const now = Date.now()
    
    // Reset counters
    if (now - this.sentCounts.lastReset.minute > 60000) { // 1 minute
      this.sentCounts.minute = 0
      this.sentCounts.lastReset.minute = now
    }
    if (now - this.sentCounts.lastReset.hour > 3600000) { // 1 hour
      this.sentCounts.hour = 0
      this.sentCounts.lastReset.hour = now
    }

    return this.sentCounts.minute < this.rateLimits.perMinute && 
           this.sentCounts.hour < this.rateLimits.perHour
  }

  /**
   * Update sent counts
   */
  private updateSentCounts() {
    this.sentCounts.minute++
    this.sentCounts.hour++
  }

  /**
   * 批量發送郵件（使用佇列系統）
   */
  async sendBulkEmails(emails: EmailContent[], priority: 'low' | 'normal' | 'high' = 'normal'): Promise<BulkEmailResult> {
    const queueId = this.generateQueueId()
    const result: BulkEmailResult = {
      success: true,
      totalSent: 0,
      totalFailed: 0,
      failedEmails: [],
      errors: [],
      queueId
    }

    // 將郵件加入佇列
    for (const email of emails) {
      await this.addToQueue({
        ...email,
        priority
      })
    }

    console.log(`✅ ${emails.length} emails added to queue with ID: ${queueId}`)
    return result
  }

  /**
   * 加入郵件佇列
   */
  private async addToQueue(emailContent: EmailContent & { priority: 'low' | 'normal' | 'high' }): Promise<string> {
    const queueItem: EmailQueueItem = {
      id: this.generateQueueId(),
      to: emailContent.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      priority: emailContent.priority,
      retryCount: 0,
      maxRetries: parseInt(process.env.EMAIL_RETRY_ATTEMPTS || '3'),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.emailQueue.push(queueItem)
    this.emailQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    return queueItem.id
  }

  /**
   * 启動佇列處理器
   */
  private startQueueProcessor() {
    if (process.env.EMAIL_QUEUE_ENABLED !== 'true') {
      console.log('⚠️ Email queue disabled')
      return
    }

    const batchSize = parseInt(process.env.EMAIL_QUEUE_BATCH_SIZE || '10')
    const delay = parseInt(process.env.EMAIL_QUEUE_DELAY || '1000')

    setInterval(async () => {
      if (this.isProcessingQueue || this.emailQueue.length === 0) return
      
      this.isProcessingQueue = true
      await this.processQueue(batchSize)
      this.isProcessingQueue = false
    }, delay)

    console.log('✅ Email queue processor started')
  }

  /**
   * 處理郵件佇列
   */
  private async processQueue(batchSize: number) {
    const batch = this.emailQueue.splice(0, batchSize).filter(item => 
      item.status === 'pending' && 
      (!item.scheduledFor || item.scheduledFor <= new Date())
    )

    for (const item of batch) {
      try {
        item.status = 'processing'
        const success = await this.sendEmail({
          to: item.to,
          subject: item.subject,
          html: item.html,
          text: item.text
        })

        if (success) {
          item.status = 'sent'
        } else {
          throw new Error('Failed to send email')
        }
      } catch (error) {
        item.retryCount++
        item.errorMessage = error instanceof Error ? error.message : String(error)
        
        if (item.retryCount >= item.maxRetries) {
          item.status = 'failed'
          console.error(`❌ Email failed permanently: ${item.subject}`, item.errorMessage)
        } else {
          item.status = 'pending'
          item.scheduledFor = new Date(Date.now() + (item.retryCount * 60000)) // Exponential backoff
          this.emailQueue.push(item) // Re-queue for retry
        }
      } finally {
        item.updatedAt = new Date()
      }
    }
  }

  /**
   * 生成佇列 ID
   */
  private generateQueueId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * 發送公告通知郵件
   */
  async sendAnnouncementEmail(
    recipients: string[],
    announcementTitle: string,
    announcementContent: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<BulkEmailResult> {
    const priorityEmoji = {
      low: '📢',
      medium: '📣',
      high: '🚨'
    }

    const subject = `${priorityEmoji[priority]} ${announcementTitle} - KCISLK ESID`
    const html = this.generateAnnouncementTemplate(announcementTitle, announcementContent, priority)

    const emails = recipients.map(email => ({
      to: email,
      subject,
      html,
      text: this.stripHtml(announcementContent)
    }))

    return this.sendBulkEmails(emails)
  }

  /**
   * 發送活動通知郵件
   */
  async sendEventNotificationEmail(
    recipients: string[],
    eventTitle: string,
    eventDate: Date,
    eventDetails: string
  ): Promise<BulkEmailResult> {
    const subject = `📅 活動提醒：${eventTitle} - KCISLK ESID`
    const html = this.generateEventTemplate(eventTitle, eventDate, eventDetails)

    const emails = recipients.map(email => ({
      to: email,
      subject,
      html,
      text: `活動：${eventTitle}\n日期：${eventDate.toLocaleDateString('zh-TW')}\n詳情：${this.stripHtml(eventDetails)}`
    }))

    return this.sendBulkEmails(emails)
  }

  /**
   * 生成歡迎郵件模板
   */
  private generateWelcomeTemplate(userName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>歡迎加入 KCISLK ESID Info Hub</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    .content { padding: 40px 30px; }
    .welcome-icon { font-size: 48px; margin-bottom: 20px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="welcome-icon">🎉</div>
      <h1 style="margin: 0; font-size: 28px;">歡迎加入!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">KCISLK ESID Info Hub</p>
    </div>
    <div class="content">
      <h2 style="color: #4f46e5;">${userName} 您好！</h2>
      <p>歡迎您加入林口康橋國際學校 Elementary School International Department (ESID) 資訊中心！</p>
      
      <h3>🎆 您可以在這裡：</h3>
      <ul style="line-height: 1.8;">
        <li>📢 最新學校公告和通知</li>
        <li>📅 活動資訊和報名</li>
        <li>📚 教育資源和教學材料</li>
        <li>💬 與其他家長和老師交流</li>
        <li>📨 個人化通知設定</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}" class="button">開始探索</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        如果您有任何問題，請隨時聯繫我們。祝您使用愛快！
      </p>
    </div>
    <div class="footer">
      © 2025 KCISLK Elementary School International Department. All rights reserved.
    </div>
  </div>
</body>
</html>`
  }

  /**
   * 生成密碼重設郵件模板
   */
  private generatePasswordResetTemplate(resetUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>重設密碼</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .warning { background: #fef3cd; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🔒 密碼重設</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">KCISLK ESID Info Hub</p>
    </div>
    <div class="content">
      <p>您好！</p>
      <p>我們收到了您的密碼重設請求。請點擊下方按鈕來重設您的密碼：</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" class="button">重設密碼</a>
      </div>
      
      <div class="warning">
        <p><strong>重要提醒：</strong></p>
        <ul>
          <li>此連結將在24小時後過期</li>
          <li>如果您沒有請求重設密碼，請忽略此郵件</li>
          <li>為了您的帳戶安全，請勿將此連結分享給他人</li>
        </ul>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        如果您無法點擊上方按鈕，請複製以下連結到瀏覽器中開啟：<br>
        <span style="word-break: break-all; color: #4f46e5;">${resetUrl}</span>
      </p>
    </div>
    <div class="footer">
      © 2025 KCISLK Elementary School International Department. All rights reserved.
    </div>
  </div>
</body>
</html>`
  }

  /**
   * 生成活動報名確認模板
   */
  private generateEventRegistrationTemplate(userName: string, eventTitle: string, eventDate: Date): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>活動報名確認</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 40px 30px; }
    .event-details { background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">✅ 報名成功!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">KCISLK ESID 活動系統</p>
    </div>
    <div class="content">
      <h2 style="color: #059669;">${userName} 您好！</h2>
      <p>恭喜您成功報名參加以下活動：</p>
      
      <div class="event-details">
        <h3 style="color: #047857; margin-top: 0;">🎉 ${eventTitle}</h3>
        <p><strong>📅 活動日期：</strong> ${eventDate.toLocaleDateString('zh-TW', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        })}</p>
        <p><strong>⏰ 活動時間：</strong> ${eventDate.toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>
      
      <h3>📄 接下來的步驟：</h3>
      <ul style="line-height: 1.8;">
        <li>我們會在活動前 24 小時發送提醒郵件</li>
        <li>請提早 15 分鐘到達活動地點</li>
        <li>如需取消報名，請至少提前 24 小時通知我們</li>
      </ul>
      
      <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;"><strong>温馨提醒：</strong> 如果您的計劃有所變更，請盡早聯繫我們，以便其他家長有機會參加。</p>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        期待在活動中與您相見！如有任何問題，請隨時聯繫我們。
      </p>
    </div>
    <div class="footer">
      © 2025 KCISLK Elementary School International Department. All rights reserved.
    </div>
  </div>
</body>
</html>`
  }

  /**
   * 生成電子報模板
   */
  private generateNewsletterTemplate(title: string, content: string, issueNumber?: number): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 40px 20px; text-align: center; }
    .content { padding: 40px 30px; }
    .issue-badge { background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 14px; margin-bottom: 10px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${issueNumber ? `<div class="issue-badge">第 ${issueNumber} 期</div>` : ''}
      <h1 style="margin: 0; font-size: 32px;">📨 ${title}</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">KCISLK ESID Newsletter</p>
    </div>
    <div class="content">
      <div style="border-left: 4px solid #8b5cf6; padding-left: 20px; margin: 20px 0;">
        ${content}
      </div>
      
      <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 8px;">
        <p style="margin: 0; color: #6b7280;">少虛我們的社群平臺，獲取更多學校資訊</p>
        <div style="margin-top: 15px;">
          <a href="#" style="display: inline-block; margin: 0 10px; color: #8b5cf6; text-decoration: none;">📱 Facebook</a>
          <a href="#" style="display: inline-block; margin: 0 10px; color: #8b5cf6; text-decoration: none;">📷 Instagram</a>
          <a href="#" style="display: inline-block; margin: 0 10px; color: #8b5cf6; text-decoration: none;">🎥 YouTube</a>
        </div>
      </div>
    </div>
    <div class="footer">
      © 2025 KCISLK Elementary School International Department. All rights reserved.
    </div>
  </div>
</body>
</html>`
  }

  /**
   * 生成活動提醒模板
   */
  private generateEventReminderTemplate(title: string, date: Date, reminderType: '24h' | '1h' | '30min'): string {
    const reminderText = {
      '24h': { text: '24小時', icon: '📅' },
      '1h': { text: '1小時', icon: '⏰' },
      '30min': { text: '30分鐘', icon: '🔔' }
    }
    const reminder = reminderText[reminderType]
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>活動提醒</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 40px 30px; }
    .reminder-box { background: #fef3cd; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">${reminder.icon} 活動提醒</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${reminder.text}後開始</p>
    </div>
    <div class="content">
      <div class="reminder-box">
        <h2 style="color: #d97706; margin-top: 0;">${title}</h2>
        <p style="font-size: 18px; margin: 15px 0;"><strong>📅 ${date.toLocaleDateString('zh-TW', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        })}</strong></p>
        <p style="font-size: 18px; margin: 15px 0;"><strong>⏰ ${date.toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit'
        })}</strong></p>
      </div>
      
      <h3>📝 參加提醒：</h3>
      <ul style="line-height: 1.8;">
        <li>請提早 15 分鐘到達活動地點</li>
        <li>請攜帶相關資料和筆記用具</li>
        <li>如有緊急情況無法出席，請盡快通知我們</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}/events" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">查看活動詳情</a>
      </div>
    </div>
    <div class="footer">
      © 2025 KCISLK Elementary School International Department. All rights reserved.
    </div>
  </div>
</body>
</html>`
  }

  /**
   * 生成系統通知模板
   */
  private generateSystemNotificationTemplate(title: string, message: string, type: 'info' | 'warning' | 'error'): string {
    const typeConfig = {
      info: { color: '#3b82f6', bgcolor: '#eff6ff', icon: '📝' },
      warning: { color: '#f59e0b', bgcolor: '#fef3cd', icon: '⚠️' },
      error: { color: '#ef4444', bgcolor: '#fef2f2', icon: '❌' }
    }
    const config = typeConfig[type]
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>系統通知</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .header { background: ${config.color}; color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 40px 30px; }
    .message-box { background: ${config.bgcolor}; border-left: 4px solid ${config.color}; padding: 20px; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">${config.icon} 系統通知</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">KCISLK ESID Info Hub</p>
    </div>
    <div class="content">
      <h2 style="color: ${config.color}; margin-bottom: 20px;">${title}</h2>
      
      <div class="message-box">
        ${message}
      </div>
      
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        此為系統自動發送的通知郵件，請勿直接回覆。如有任何問題，請聯繫系統管理員。
      </p>
    </div>
    <div class="footer">
      © 2025 KCISLK Elementary School International Department. All rights reserved.
    </div>
  </div>
</body>
</html>`
  }

  /**
   * 生成每日摘要模板
   */
  private generateDailyDigestTemplate(
    userName: string,
    digestData: {
      announcements: any[]
      events: any[]
      notifications: any[]
    }
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>每日摘要</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px; }
    .section { margin: 30px 0; }
    .section-title { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px; }
    .item { background: #f8fafc; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #4f46e5; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">📅 今日摘要</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
    </div>
    <div class="content">
      <p>早安，${userName}！以下是您今日的重要資訊摘要：</p>
      
      ${digestData.announcements.length > 0 ? `
      <div class="section">
        <h2 class="section-title">📢 最新公告 (${digestData.announcements.length})</h2>
        ${digestData.announcements.map(announcement => `
        <div class="item">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">${announcement.title}</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">${announcement.summary || '立即查看完整內容...'}</p>
        </div>
        `).join('')}
      </div>
      ` : ''}
      
      ${digestData.events.length > 0 ? `
      <div class="section">
        <h2 class="section-title">📅 即將到來的活動 (${digestData.events.length})</h2>
        ${digestData.events.map(event => `
        <div class="item">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">${event.title}</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            📅 ${new Date(event.startDate).toLocaleDateString('zh-TW')}
            ${event.startTime ? ` ⏰ ${new Date(event.startTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}` : ''}
          </p>
        </div>
        `).join('')}
      </div>
      ` : ''}
      
      ${digestData.notifications.length > 0 ? `
      <div class="section">
        <h2 class="section-title">🔔 未讀通知 (${digestData.notifications.length})</h2>
        ${digestData.notifications.slice(0, 5).map(notification => `
        <div class="item">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">${notification.title}</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">${notification.message.substring(0, 100)}...</p>
        </div>
        `).join('')}
        ${digestData.notifications.length > 5 ? `<p style="text-align: center; color: #6b7280;">還有 ${digestData.notifications.length - 5} 則通知...</p>` : ''}
      </div>
      ` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">前往主頁</a>
      </div>
    </div>
    <div class="footer">
      © 2025 KCISLK Elementary School International Department. All rights reserved.
    </div>
  </div>
</body>
</html>`
  }

  /**
   * 生成公告郵件模板
   */
  private generateAnnouncementTemplate(
    title: string, 
    content: string, 
    priority: 'low' | 'medium' | 'high'
  ): string {
    const priorityColor = {
      low: '#10B981',
      medium: '#F59E0B', 
      high: '#EF4444'
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 40px 30px; }
    .priority-badge { 
      display: inline-block; 
      padding: 6px 16px; 
      border-radius: 20px; 
      color: white; 
      font-size: 12px; 
      font-weight: bold;
      background-color: ${priorityColor[priority]};
      margin-bottom: 20px;
    }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">KCISLK ESID Info Hub</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">林口康橋國際學校 Elementary School International Department</p>
    </div>
    <div class="content">
      <div>
        <span class="priority-badge">${priority.toUpperCase()}</span>
      </div>
      <h2 style="color: #4f46e5; margin-bottom: 20px;">${title}</h2>
      <div style="background: #f8fafc; padding: 25px; border-left: 4px solid #4f46e5; margin: 25px 0; border-radius: 0 6px 6px 0;">
        ${content}
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}/announcements" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">查看更多公告</a>
      </div>
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        此郵件由 KCISLK ESID Info Hub 系統自動發送，請勿直接回覆此郵件。
      </p>
    </div>
    <div class="footer">
      © 2025 KCISLK Elementary School International Department. All rights reserved.
    </div>
  </div>
</body>
</html>`
  }

  /**
   * 生成活動通知郵件模板
   */
  private generateEventTemplate(title: string, date: Date, details: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>活動通知：${title}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .event-date { background: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">📅 活動通知</h1>
      <p style="margin: 5px 0 0 0;">KCISLK ESID Info Hub</p>
    </div>
    <div class="content">
      <h2 style="color: #059669; margin-bottom: 15px;">${title}</h2>
      <div class="event-date">
        <strong>🗓️ 活動日期：</strong> ${date.toLocaleDateString('zh-TW', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        })}
      </div>
      <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #059669; margin: 20px 0;">
        ${details}
      </div>
      <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
        此郵件由 KCISLK ESID Info Hub 系統自動發送，請勿直接回覆此郵件。
      </p>
    </div>
    <div class="footer">
      © 2025 KCISLK Elementary School International Department. All rights reserved.
    </div>
  </div>
</body>
</html>`
  }

  /**
   * 移除 HTML 標籤（用於純文字版本）
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  }

  /**
   * 發送歡迎郵件
   */
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const subject = '歡迎加入 KCISLK ESID Info Hub! 🎉'
    const html = this.generateWelcomeTemplate(userName)
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text: `歡迎 ${userName} 加入 KCISLK ESID Info Hub!`
    })
  }

  /**
   * 發送密碼重設郵件
   */
  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
    const subject = '重設您的 KCISLK ESID 帳戶密碼'
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
    const html = this.generatePasswordResetTemplate(resetUrl)
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text: `請點擊以下連結重設密碼: ${resetUrl}`
    })
  }

  /**
   * 發送活動報名確認郵件
   */
  async sendEventRegistrationConfirmation(
    userEmail: string, 
    userName: string, 
    eventTitle: string, 
    eventDate: Date
  ): Promise<boolean> {
    const subject = `✅ 活動報名確認: ${eventTitle}`
    const html = this.generateEventRegistrationTemplate(userName, eventTitle, eventDate)
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text: `${userName} 您好，您已成功報名參加活動: ${eventTitle}`
    })
  }

  /**
   * 發送電子報電子郵件
   */
  async sendNewsletterEmail(
    recipients: string[],
    newsletterTitle: string,
    newsletterContent: string,
    issueNumber?: number
  ): Promise<BulkEmailResult> {
    const subject = `📨 ${newsletterTitle}${issueNumber ? ` - 第${issueNumber}期` : ''}`
    const html = this.generateNewsletterTemplate(newsletterTitle, newsletterContent, issueNumber)
    
    const emails = recipients.map(email => ({
      to: email,
      subject,
      html,
      text: this.stripHtml(newsletterContent)
    }))
    
    return this.sendBulkEmails(emails, 'normal')
  }

  /**
   * 發送活動提醒郵件
   */
  async sendEventReminderEmail(
    recipients: string[],
    eventTitle: string,
    eventDate: Date,
    reminderType: '24h' | '1h' | '30min' = '24h'
  ): Promise<BulkEmailResult> {
    const reminderText = {
      '24h': '24小時',
      '1h': '1小時',
      '30min': '30分鐘'
    }
    
    const subject = `⏰ 活動提醒: ${eventTitle} - ${reminderText[reminderType]}後開始`
    const html = this.generateEventReminderTemplate(eventTitle, eventDate, reminderType)
    
    const emails = recipients.map(email => ({
      to: email,
      subject,
      html,
      text: `活動 ${eventTitle} 將於 ${reminderText[reminderType]} 後開始`
    }))
    
    return this.sendBulkEmails(emails, 'high')
  }

  /**
   * 發送系統通知郵件
   */
  async sendSystemNotificationEmail(
    recipients: string[],
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' = 'info'
  ): Promise<BulkEmailResult> {
    const typeEmoji = { info: '📝', warning: '⚠️', error: '❌' }
    const subject = `${typeEmoji[type]} 系統通知: ${title}`
    const html = this.generateSystemNotificationTemplate(title, message, type)
    
    const emails = recipients.map(email => ({
      to: email,
      subject,
      html,
      text: `${title}\n\n${this.stripHtml(message)}`
    }))
    
    return this.sendBulkEmails(emails, type === 'error' ? 'high' : 'normal')
  }

  /**
   * 發送每日摘要郵件
   */
  async sendDailyDigestEmail(
    userEmail: string,
    userName: string,
    digestData: {
      announcements: any[]
      events: any[]
      notifications: any[]
    }
  ): Promise<boolean> {
    const subject = '📅 KCISLK ESID 今日摘要'
    const html = this.generateDailyDigestTemplate(userName, digestData)
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text: `${userName} 您好，以下是您的今日摘要...`
    })
  }

  /**
   * 測試郵件服務連接
   */
  async testConnection(): Promise<boolean> {
    await this.ensureInitialized()
    
    if (!this.transporter) {
      return false
    }

    try {
      await this.transporter.verify()
      console.log('✅ Email service connection verified')
      return true
    } catch (error) {
      console.error('❌ Email service connection failed:', error)
      return false
    }
  }

  /**
   * 發送測試郵件
   */
  async sendTestEmail(recipient?: string): Promise<boolean> {
    await this.ensureInitialized()
    
    const testRecipient = recipient || process.env.EMAIL_TEST_RECIPIENT
    if (!testRecipient) {
      console.error('❌ No test recipient specified')
      return false
    }

    const subject = '📧 KCISLK ESID Email Service Test'
    const html = `
      <h2>電子郵件服務測試</h2>
      <p>此為測試郵件，用於驗證 KCISLK ESID Info Hub 電子郵件服務正常運作。</p>
      <p><strong>測試時間:</strong> ${new Date().toLocaleString('zh-TW')}</p>
      <p><strong>提供商:</strong> ${this.provider}</p>
    `

    return this.sendEmail({
      to: testRecipient,
      subject,
      html,
      text: '電子郵件服務測試成功'
    })
  }

  /**
   * 取得佇列統計
   */
  getQueueStats() {
    const stats = {
      total: this.emailQueue.length,
      pending: this.emailQueue.filter(item => item.status === 'pending').length,
      processing: this.emailQueue.filter(item => item.status === 'processing').length,
      failed: this.emailQueue.filter(item => item.status === 'failed').length,
      sent: this.emailQueue.filter(item => item.status === 'sent').length,
      rateLimits: this.rateLimits,
      sentCounts: this.sentCounts
    }
    return stats
  }
}

// 導出單例
export default new EmailService()
export { EmailService }