/**
 * Email Service for KCISLK ESID Info Hub
 * 電子郵件服務模組
 * 
 * @description 處理電子郵件發送、模板渲染和通知服務
 * @features Email 發送、模板系統、批量發送、錯誤處理
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import nodemailer, { Transporter } from 'nodemailer'

// Email 配置介面
interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// Email 內容介面
interface EmailContent {
  to: string | string[]
  subject: string
  html: string
  text?: string
  cc?: string[]
  bcc?: string[]
}

// Email 模板類型
export type EmailTemplateType = 
  | 'announcement' 
  | 'event_notification'
  | 'welcome'
  | 'password_reset'
  | 'newsletter'
  | 'reminder'

// 模板資料介面
export interface TemplateData {
  [key: string]: any
}

// 批量發送結果
export interface BulkEmailResult {
  success: boolean
  totalSent: number
  totalFailed: number
  failedEmails: string[]
  errors: string[]
}

class EmailService {
  private transporter: Transporter | null = null
  private readonly fromAddress: string
  private readonly fromName: string

  constructor() {
    this.fromAddress = process.env.EMAIL_FROM || 'noreply@kcislk.ntpc.edu.tw'
    this.fromName = process.env.EMAIL_FROM_NAME || 'KCISLK ESID Info Hub'
    
    this.initializeTransporter()
  }

  /**
   * 初始化郵件傳輸器
   */
  private initializeTransporter() {
    // 檢查是否有 Email 配置
    const emailHost = process.env.EMAIL_HOST
    const emailUser = process.env.EMAIL_USER  
    const emailPass = process.env.EMAIL_PASS

    if (!emailHost || !emailUser || !emailPass) {
      console.warn('⚠️ Email service not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS environment variables.')
      return
    }

    const config: EmailConfig = {
      host: emailHost,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    }

    try {
      this.transporter = nodemailer.createTransporter(config)
      console.log('✅ Email service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error)
    }
  }

  /**
   * 發送單一郵件
   */
  async sendEmail(emailContent: EmailContent): Promise<boolean> {
    if (!this.transporter) {
      console.error('❌ Email service not initialized')
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
      console.log('✅ Email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      return false
    }
  }

  /**
   * 批量發送郵件
   */
  async sendBulkEmails(emails: EmailContent[]): Promise<BulkEmailResult> {
    const result: BulkEmailResult = {
      success: false,
      totalSent: 0,
      totalFailed: 0,
      failedEmails: [],
      errors: []
    }

    if (!this.transporter) {
      result.errors.push('Email service not initialized')
      return result
    }

    for (const email of emails) {
      try {
        const sent = await this.sendEmail(email)
        if (sent) {
          result.totalSent++
        } else {
          result.totalFailed++
          result.failedEmails.push(Array.isArray(email.to) ? email.to.join(',') : email.to)
        }
      } catch (error) {
        result.totalFailed++
        result.failedEmails.push(Array.isArray(email.to) ? email.to.join(',') : email.to)
        result.errors.push(error instanceof Error ? error.message : String(error))
      }
    }

    result.success = result.totalFailed === 0
    return result
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
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .priority-badge { 
      display: inline-block; 
      padding: 4px 12px; 
      border-radius: 20px; 
      color: white; 
      font-size: 12px; 
      font-weight: bold;
      background-color: ${priorityColor[priority]};
    }
    .footer { background: #f9fafb; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">KCISLK ESID Info Hub</h1>
      <p style="margin: 5px 0 0 0;">林口康橋國際學校 Elementary School International Department</p>
    </div>
    <div class="content">
      <div style="margin-bottom: 15px;">
        <span class="priority-badge">${priority.toUpperCase()}</span>
      </div>
      <h2 style="color: #4f46e5; margin-bottom: 15px;">${title}</h2>
      <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #4f46e5; margin: 20px 0;">
        ${content}
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
   * 測試郵件服務連接
   */
  async testConnection(): Promise<boolean> {
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
}

// 導出單例
export default new EmailService()
export { EmailService }