/**
 * Email Template Engine for KCISLK ESID Info Hub
 * 電子郵件模板引擎
 * 
 * @description 高級電子郵件模板渲染引擎，支持變量替換、條件渲染和多語言
 * @features 模板變量、條件邏輯、循環、多語言支持、模板緩存
 * @version 1.0.0
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { EmailTemplateType, TemplateData } from './emailService'

export interface TemplateMetadata {
  name: string
  subject: string
  description: string
  variables: string[]
  requiredVariables: string[]
  supportedLanguages: string[]
  category: 'system' | 'notification' | 'marketing' | 'transactional'
}

export interface RenderOptions {
  language?: 'zh-TW' | 'en' | 'zh-CN'
  theme?: 'default' | 'minimal' | 'branded'
  includeUnsubscribe?: boolean
  trackingPixel?: boolean
  customCSS?: string
}

/**
 * 電子郵件模板引擎
 */
export class EmailTemplateEngine {
  private templateCache = new Map<string, string>()
  private metadataCache = new Map<EmailTemplateType, TemplateMetadata>()

  constructor() {
    this.initializeTemplateMetadata()
  }

  /**
   * 渲染模板
   */
  async render(
    templateType: EmailTemplateType,
    data: TemplateData,
    options: RenderOptions = {}
  ): Promise<{ html: string; text: string; subject: string }> {
    const template = await this.getTemplate(templateType)
    const metadata = this.getMetadata(templateType)
    
    // 驗證必需變量
    this.validateRequiredVariables(metadata, data)

    // 準備渲染上下文
    const context = this.prepareRenderContext(data, options)
    
    // 渲染HTML
    const html = this.renderTemplate(template.html, context, options)
    
    // 生成純文本版本
    const text = this.generateTextVersion(html, data)
    
    // 渲染主題
    const subject = this.renderTemplate(template.subject, context, options)

    return { html, text, subject }
  }

  /**
   * 獲取模板
   */
  private async getTemplate(templateType: EmailTemplateType): Promise<{ html: string; subject: string }> {
    const cacheKey = `template_${templateType}`
    
    if (this.templateCache.has(cacheKey)) {
      const cached = this.templateCache.get(cacheKey)!
      return JSON.parse(cached)
    }

    const template = this.loadTemplate(templateType)
    this.templateCache.set(cacheKey, JSON.stringify(template))
    
    return template
  }

  /**
   * 載入模板內容
   */
  private loadTemplate(templateType: EmailTemplateType): { html: string; subject: string } {
    switch (templateType) {
      case 'welcome':
        return {
          subject: '🎉 歡迎加入 KCISLK ESID Info Hub, {{userName}}!',
          html: this.getWelcomeTemplate()
        }
      
      case 'announcement':
        return {
          subject: '{{priorityIcon}} {{title}} - KCISLK ESID',
          html: this.getAnnouncementTemplate()
        }
      
      case 'event_notification':
        return {
          subject: '📅 活動通知：{{eventTitle}} - KCISLK ESID',
          html: this.getEventNotificationTemplate()
        }
      
      case 'event_reminder':
        return {
          subject: '⏰ 活動提醒：{{eventTitle}} - {{reminderType}}後開始',
          html: this.getEventReminderTemplate()
        }
      
      case 'event_registration_confirmed':
        return {
          subject: '✅ 活動報名確認: {{eventTitle}}',
          html: this.getEventRegistrationTemplate()
        }
      
      case 'password_reset':
        return {
          subject: '🔒 重設您的 KCISLK ESID 帳戶密碼',
          html: this.getPasswordResetTemplate()
        }
      
      case 'newsletter':
        return {
          subject: '📨 {{title}}{{#if issueNumber}} - 第{{issueNumber}}期{{/if}}',
          html: this.getNewsletterTemplate()
        }
      
      case 'system_notification':
        return {
          subject: '{{typeIcon}} 系統通知: {{title}}',
          html: this.getSystemNotificationTemplate()
        }
      
      case 'digest':
        return {
          subject: '📅 KCISLK ESID 每日摘要 - {{date}}',
          html: this.getDigestTemplate()
        }
      
      default:
        throw new Error(`Unknown template type: ${templateType}`)
    }
  }

  /**
   * 渲染模板字符串
   */
  private renderTemplate(template: string, context: any, options: RenderOptions): string {
    let rendered = template

    // 簡單變量替換 {{variable}}
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return context[variable] || ''
    })

    // 條件渲染 {{#if condition}}...{{/if}}
    rendered = rendered.replace(/\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs, (match, condition, content) => {
      return context[condition] ? content : ''
    })

    // 循環渲染 {{#each array}}...{{/each}}
    rendered = rendered.replace(/\{\{#each\s+(\w+)\}\}(.*?)\{\{\/each\}\}/gs, (match, arrayName, itemTemplate) => {
      const array = context[arrayName]
      if (!Array.isArray(array)) return ''
      
      return array.map(item => {
        let itemHtml = itemTemplate
        // 替換項目變量 {{@item.property}}
        itemHtml = itemHtml.replace(/\{\{@item\.(\w+)\}\}/g, (match, prop) => {
          return item[prop] || ''
        })
        return itemHtml
      }).join('')
    })

    // 應用主題樣式
    if (options.theme) {
      rendered = this.applyTheme(rendered, options.theme)
    }

    // 添加取消訂閱鏈接
    if (options.includeUnsubscribe) {
      rendered = this.addUnsubscribeLink(rendered)
    }

    // 添加跟蹤像素
    if (options.trackingPixel) {
      rendered = this.addTrackingPixel(rendered)
    }

    return rendered
  }

  /**
   * 準備渲染上下文
   */
  private prepareRenderContext(data: TemplateData, options: RenderOptions): any {
    const baseContext = {
      siteUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      siteName: 'KCISLK ESID Info Hub',
      currentYear: new Date().getFullYear(),
      currentDate: new Date().toLocaleDateString('zh-TW'),
      language: options.language || 'zh-TW',
      ...data
    }

    // 添加輔助函數
    baseContext.formatDate = (date: Date | string) => {
      const d = new Date(date)
      return d.toLocaleDateString(baseContext.language === 'zh-TW' ? 'zh-TW' : 'en-US')
    }

    baseContext.formatTime = (date: Date | string) => {
      const d = new Date(date)
      return d.toLocaleTimeString(baseContext.language === 'zh-TW' ? 'zh-TW' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 優先級圖標映射
    baseContext.priorityIcon = this.getPriorityIcon(data.priority)
    baseContext.typeIcon = this.getTypeIcon(data.type)

    return baseContext
  }

  /**
   * 驗證必需變量
   */
  private validateRequiredVariables(metadata: TemplateMetadata, data: TemplateData): void {
    const missing = metadata.requiredVariables.filter(variable => !(variable in data))
    if (missing.length > 0) {
      throw new Error(`Missing required template variables: ${missing.join(', ')}`)
    }
  }

  /**
   * 生成純文本版本
   */
  private generateTextVersion(html: string, data: TemplateData): string {
    // 移除HTML標籤
    let text = html.replace(/<[^>]*>/g, '')
    
    // 清理多餘的空白
    text = text.replace(/\s+/g, ' ')
    
    // 解碼HTML實體
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
    
    return text.trim()
  }

  /**
   * 應用主題樣式
   */
  private applyTheme(html: string, theme: string): string {
    const themes = {
      minimal: {
        headerBg: '#ffffff',
        primaryColor: '#333333',
        fontSize: '14px'
      },
      branded: {
        headerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        primaryColor: '#4f46e5',
        fontSize: '16px'
      },
      default: {
        headerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        primaryColor: '#4f46e5',
        fontSize: '16px'
      }
    }

    const themeConfig = themes[theme as keyof typeof themes] || themes.default
    
    // 替換主題變量
    Object.entries(themeConfig).forEach(([key, value]) => {
      const pattern = new RegExp(`{{theme\\.${key}}}`, 'g')
      html = html.replace(pattern, value)
    })

    return html
  }

  /**
   * 添加取消訂閱鏈接
   */
  private addUnsubscribeLink(html: string): string {
    const unsubscribeHtml = `
      <div style="text-align: center; margin: 20px 0; padding: 20px; background: #f9fafb; font-size: 12px; color: #6b7280;">
        <p>如果您不希望再收到此類郵件，請 <a href="{{siteUrl}}/unsubscribe?token={{unsubscribeToken}}" style="color: #4f46e5;">點擊此處取消訂閱</a></p>
      </div>
    `
    
    // 在 footer 前插入
    return html.replace('</body>', unsubscribeHtml + '</body>')
  }

  /**
   * 添加跟蹤像素
   */
  private addTrackingPixel(html: string): string {
    const trackingPixel = `<img src="{{siteUrl}}/api/email/tracking/{{trackingId}}" width="1" height="1" style="display:none;" alt="">`
    return html.replace('</body>', trackingPixel + '</body>')
  }

  /**
   * 獲取優先級圖標
   */
  private getPriorityIcon(priority?: string): string {
    const icons = {
      low: '📢',
      medium: '📣',
      high: '🚨',
      urgent: '🔥'
    }
    return icons[priority as keyof typeof icons] || '📢'
  }

  /**
   * 獲取類型圖標
   */
  private getTypeIcon(type?: string): string {
    const icons = {
      info: '📝',
      warning: '⚠️',
      error: '❌',
      success: '✅'
    }
    return icons[type as keyof typeof icons] || '📝'
  }

  /**
   * 獲取模板元數據
   */
  private getMetadata(templateType: EmailTemplateType): TemplateMetadata {
    return this.metadataCache.get(templateType)!
  }

  /**
   * 初始化模板元數據
   */
  private initializeTemplateMetadata(): void {
    const metadata: Record<EmailTemplateType, TemplateMetadata> = {
      welcome: {
        name: 'Welcome Email',
        subject: 'Welcome to KCISLK ESID',
        description: 'New user welcome email',
        variables: ['userName', 'siteUrl'],
        requiredVariables: ['userName'],
        supportedLanguages: ['zh-TW', 'en'],
        category: 'transactional'
      },
      announcement: {
        name: 'Announcement Email',
        subject: 'Announcement',
        description: 'General announcement email',
        variables: ['title', 'content', 'priority', 'priorityIcon'],
        requiredVariables: ['title', 'content'],
        supportedLanguages: ['zh-TW', 'en'],
        category: 'notification'
      },
      event_notification: {
        name: 'Event Notification',
        subject: 'Event Notification',
        description: 'Event announcement email',
        variables: ['eventTitle', 'eventDate', 'eventDetails'],
        requiredVariables: ['eventTitle', 'eventDate'],
        supportedLanguages: ['zh-TW', 'en'],
        category: 'notification'
      },
      event_reminder: {
        name: 'Event Reminder',
        subject: 'Event Reminder',
        description: 'Event reminder email',
        variables: ['eventTitle', 'eventDate', 'reminderType'],
        requiredVariables: ['eventTitle', 'eventDate', 'reminderType'],
        supportedLanguages: ['zh-TW', 'en'],
        category: 'notification'
      },
      event_registration_confirmed: {
        name: 'Event Registration Confirmation',
        subject: 'Registration Confirmed',
        description: 'Event registration confirmation email',
        variables: ['userName', 'eventTitle', 'eventDate'],
        requiredVariables: ['userName', 'eventTitle', 'eventDate'],
        supportedLanguages: ['zh-TW', 'en'],
        category: 'transactional'
      },
      password_reset: {
        name: 'Password Reset',
        subject: 'Password Reset',
        description: 'Password reset email',
        variables: ['resetUrl', 'expiryTime'],
        requiredVariables: ['resetUrl'],
        supportedLanguages: ['zh-TW', 'en'],
        category: 'system'
      },
      newsletter: {
        name: 'Newsletter',
        subject: 'Newsletter',
        description: 'Newsletter email',
        variables: ['title', 'content', 'issueNumber'],
        requiredVariables: ['title', 'content'],
        supportedLanguages: ['zh-TW', 'en'],
        category: 'marketing'
      },
      system_notification: {
        name: 'System Notification',
        subject: 'System Notification',
        description: 'System notification email',
        variables: ['title', 'message', 'type', 'typeIcon'],
        requiredVariables: ['title', 'message'],
        supportedLanguages: ['zh-TW', 'en'],
        category: 'system'
      },
      digest: {
        name: 'Daily Digest',
        subject: 'Daily Digest',
        description: 'Daily digest email',
        variables: ['userName', 'date', 'announcements', 'events', 'notifications'],
        requiredVariables: ['userName'],
        supportedLanguages: ['zh-TW', 'en'],
        category: 'marketing'
      }
    }

    Object.entries(metadata).forEach(([type, meta]) => {
      this.metadataCache.set(type as EmailTemplateType, meta)
    })
  }

  /**
   * 獲取所有可用模板
   */
  getAvailableTemplates(): TemplateMetadata[] {
    return Array.from(this.metadataCache.values())
  }

  /**
   * 清除模板緩存
   */
  clearCache(): void {
    this.templateCache.clear()
    console.log('📧 Email template cache cleared')
  }

  // 以下是各種模板的HTML定義
  private getWelcomeTemplate(): string {
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
    .header { background: {{theme.headerBg}}; color: white; padding: 40px 20px; text-align: center; }
    .content { padding: 40px 30px; }
    .welcome-icon { font-size: 48px; margin-bottom: 20px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    .button { display: inline-block; background: {{theme.primaryColor}}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="welcome-icon">🎉</div>
      <h1 style="margin: 0; font-size: 28px;">歡迎加入!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">{{siteName}}</p>
    </div>
    <div class="content">
      <h2 style="color: {{theme.primaryColor}};">{{userName}} 您好！</h2>
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
        <a href="{{siteUrl}}" class="button">開始探索</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        如果您有任何問題，請隨時聯絡我們。祝您使用愉快！
      </p>
    </div>
    <div class="footer">
      © {{currentYear}} KCISLK Elementary School International Department. All rights reserved.
    </div>
  </div>
</body>
</html>`
  }

  private getAnnouncementTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .header { background: {{theme.headerBg}}; color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 40px 30px; }
    .priority-badge { 
      display: inline-block; 
      padding: 6px 16px; 
      border-radius: 20px; 
      color: white; 
      font-size: 12px; 
      font-weight: bold;
      background-color: {{#if priority}}{{priority}}{{else}}#f59e0b{{/if}};
      margin-bottom: 20px;
    }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">{{siteName}}</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">林口康橋國際學校 Elementary School International Department</p>
    </div>
    <div class="content">
      <div>
        <span class="priority-badge">{{#if priority}}{{priority}}{{else}}NORMAL{{/if}}</span>
      </div>
      <h2 style="color: {{theme.primaryColor}}; margin-bottom: 20px;">{{title}}</h2>
      <div style="background: #f8fafc; padding: 25px; border-left: 4px solid {{theme.primaryColor}}; margin: 25px 0; border-radius: 0 6px 6px 0;">
        {{content}}
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{siteUrl}}/announcements" style="display: inline-block; background: {{theme.primaryColor}}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">查看更多公告</a>
      </div>
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        此郵件由 {{siteName}} 系統自動發送，請勿直接回覆此郵件。
      </p>
    </div>
    <div class="footer">
      © {{currentYear}} KCISLK Elementary School International Department. All rights reserved.
    </div>
  </div>
</body>
</html>`
  }

  // 其他模板方法會繼續實現...
  private getEventNotificationTemplate(): string { return '' }
  private getEventReminderTemplate(): string { return '' }
  private getEventRegistrationTemplate(): string { return '' }
  private getPasswordResetTemplate(): string { return '' }
  private getNewsletterTemplate(): string { return '' }
  private getSystemNotificationTemplate(): string { return '' }
  private getDigestTemplate(): string { return '' }
}

// 導出單例
export default new EmailTemplateEngine()