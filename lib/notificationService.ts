/**
 * Notification Service - Core notification system functionality
 * 通知服務 - 核心通知系統功能
 * 
 * @description 提供完整的通知管理服務，包括發送、模板、偏好設定等功能
 * @features 通知發送、模板管理、去重機制、批量操作、即時推送
 * @author Claude Code | Generated for ES International Department
 */

import { prisma } from '@/lib/prisma'
import emailService from '@/lib/emailService'
import { 
  NotificationType, 
  NotificationPriority, 
  NotificationTemplate,
  NotificationFormData,
  NotificationSendResult,
  NotificationTemplateConfig,
  NotificationPreferences,
  BulkNotificationOperation
} from '@/lib/types'

/**
 * 通知模板配置
 */
const NOTIFICATION_TEMPLATES: Record<NotificationTemplate, NotificationTemplateConfig> = {
  announcement_published: {
    id: 'announcement_published',
    name: '公告發布通知',
    description: '當新公告發布時發送給目標用戶',
    subject: '新公告：{{title}}',
    body: '我們發布了一則新公告：{{title}}。請點擊查看詳細內容。',
    variables: ['title', 'summary', 'author'],
    defaultPriority: 'medium',
    category: 'announcement'
  },
  event_created: {
    id: 'event_created',
    name: '活動建立通知',
    description: '當新活動建立時發送通知',
    subject: '新活動：{{title}}',
    body: '新活動「{{title}}」已建立，活動日期：{{startDate}}，地點：{{location}}。',
    variables: ['title', 'description', 'startDate', 'location'],
    defaultPriority: 'medium',
    category: 'event'
  },
  event_updated: {
    id: 'event_updated',
    name: '活動更新通知',
    description: '當活動資訊有重要更新時發送',
    subject: '活動更新：{{title}}',
    body: '活動「{{title}}」的資訊已更新，請確認最新詳情。',
    variables: ['title', 'changes', 'startDate'],
    defaultPriority: 'high',
    category: 'event'
  },
  event_cancelled: {
    id: 'event_cancelled',
    name: '活動取消通知',
    description: '當活動被取消時發送緊急通知',
    subject: '重要：活動取消 - {{title}}',
    body: '很抱歉，活動「{{title}}」已被取消。如有疑問請聯繫我們。',
    variables: ['title', 'reason', 'contact'],
    defaultPriority: 'urgent',
    category: 'event'
  },
  registration_confirmed: {
    id: 'registration_confirmed',
    name: '報名確認通知',
    description: '當用戶成功報名活動時發送確認',
    subject: '報名確認：{{eventTitle}}',
    body: '您已成功報名活動「{{eventTitle}}」，活動日期：{{startDate}}。',
    variables: ['eventTitle', 'startDate', 'location', 'participantName'],
    defaultPriority: 'medium',
    category: 'registration'
  },
  registration_waitlist: {
    id: 'registration_waitlist',
    name: '候補名單通知',
    description: '當用戶被加入候補名單時發送',
    subject: '候補名單：{{eventTitle}}',
    body: '您已加入活動「{{eventTitle}}」的候補名單，如有名額釋出將立即通知您。',
    variables: ['eventTitle', 'waitlistPosition'],
    defaultPriority: 'medium',
    category: 'registration'
  },
  registration_cancelled: {
    id: 'registration_cancelled',
    name: '報名取消通知',
    description: '當報名被取消時發送確認',
    subject: '報名取消：{{eventTitle}}',
    body: '您的報名「{{eventTitle}}」已取消。如有疑問請聯繫我們。',
    variables: ['eventTitle', 'reason'],
    defaultPriority: 'medium',
    category: 'registration'
  },
  resource_uploaded: {
    id: 'resource_uploaded',
    name: '資源上傳通知',
    description: '當新教學資源上傳時發送通知',
    subject: '新資源：{{title}}',
    body: '新的教學資源「{{title}}」已上傳，適用於{{gradeLevel}}。',
    variables: ['title', 'description', 'gradeLevel', 'category'],
    defaultPriority: 'low',
    category: 'resource'
  },
  newsletter_published: {
    id: 'newsletter_published',
    name: '電子報發布通知',
    description: '當新電子報發布時發送通知',
    subject: '電子報第{{issueNumber}}期已發布',
    body: '電子報第{{issueNumber}}期「{{title}}」已發布，點擊查看精彩內容。',
    variables: ['title', 'issueNumber', 'coverImage'],
    defaultPriority: 'low',
    category: 'newsletter'
  },
  system_maintenance: {
    id: 'system_maintenance',
    name: '系統維護通知',
    description: '系統維護時發送的通知',
    subject: '系統維護通知',
    body: '系統將於{{startTime}}至{{endTime}}進行維護，期間服務可能暫停。',
    variables: ['startTime', 'endTime', 'description'],
    defaultPriority: 'high',
    category: 'maintenance'
  },
  reminder_event: {
    id: 'reminder_event',
    name: '活動提醒通知',
    description: '活動前的提醒通知',
    subject: '活動提醒：{{title}}',
    body: '提醒您，活動「{{title}}」將於{{timeUntil}}開始，請準時參加。',
    variables: ['title', 'timeUntil', 'location'],
    defaultPriority: 'medium',
    category: 'reminder'
  },
  reminder_deadline: {
    id: 'reminder_deadline',
    name: '截止日期提醒',
    description: '重要截止日期的提醒通知',
    subject: '截止提醒：{{title}}',
    body: '提醒您，「{{title}}」的截止日期為{{deadline}}，請及時處理。',
    variables: ['title', 'deadline', 'description'],
    defaultPriority: 'high',
    category: 'reminder'
  }
}

/**
 * 默認通知偏好設定
 */
const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: true,
  system: true,
  browser: true,
  doNotDisturb: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00'
  },
  categories: {
    system: { enabled: true, email: true, system: true },
    announcement: { enabled: true, email: true, system: true },
    event: { enabled: true, email: true, system: true },
    registration: { enabled: true, email: true, system: true },
    resource: { enabled: true, email: false, system: true },
    newsletter: { enabled: true, email: true, system: false },
    maintenance: { enabled: true, email: true, system: true },
    reminder: { enabled: true, email: true, system: true }
  }
}

/**
 * 通知服務類
 */
export class NotificationService {
  
  /**
   * 發送單一通知
   */
  static async sendNotification(data: NotificationFormData): Promise<NotificationSendResult> {
    try {
      const recipients = await this.getRecipients(data)
      
      if (recipients.length === 0) {
        return {
          success: false,
          totalSent: 0,
          totalFailed: 0,
          recipients: { success: [], failed: [] },
          errors: ['No recipients found']
        }
      }

      // 應用通知模板
      let title = data.title
      let message = data.message
      
      if (data.template) {
        const template = NOTIFICATION_TEMPLATES[data.template]
        title = this.applyTemplate(template.subject, data)
        message = this.applyTemplate(template.body, data)
      }

      // 檢查重複通知（去重機制）
      const duplicateCheck = await this.checkDuplicateNotifications(
        recipients, 
        title, 
        data.type, 
        data.relatedId
      )
      
      const uniqueRecipients = recipients.filter(
        id => !duplicateCheck.includes(id)
      )

      // 批量建立通知記錄
      const notifications = uniqueRecipients.map(recipientId => ({
        recipientId,
        title,
        message,
        type: data.type,
        priority: data.priority,
        relatedId: data.relatedId,
        relatedType: data.relatedType,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
      }))

      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications
        })
      }

      // 實作即時推送 (SSE/WebSocket)
      await this.pushRealTimeNotifications(notifications)

      // 實作 Email 通知發送
      await this.sendEmailNotifications(notifications)

      return {
        success: true,
        totalSent: notifications.length,
        totalFailed: recipients.length - notifications.length,
        recipients: {
          success: uniqueRecipients,
          failed: recipients.filter(id => !uniqueRecipients.includes(id))
        }
      }

    } catch (error) {
      console.error('Send notification error:', error)
      return {
        success: false,
        totalSent: 0,
        totalFailed: 0,
        recipients: { success: [], failed: [] },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * 批量通知操作
   */
  static async bulkOperation(
    userId: string, 
    operation: BulkNotificationOperation
  ): Promise<{ success: boolean; affectedCount: number }> {
    try {
      let result

      switch (operation.action) {
        case 'mark_read':
          result = await prisma.notification.updateMany({
            where: {
              id: { in: operation.notificationIds },
              recipientId: userId,
              isRead: false
            },
            data: {
              isRead: true,
              readAt: new Date()
            }
          })
          break

        case 'mark_unread':
          result = await prisma.notification.updateMany({
            where: {
              id: { in: operation.notificationIds },
              recipientId: userId,
              isRead: true
            },
            data: {
              isRead: false,
              readAt: null
            }
          })
          break

        case 'archive':
          // 在實際應用中，可能需要添加 archived 欄位到 schema
          // 這裡暫時標記為已讀
          result = await prisma.notification.updateMany({
            where: {
              id: { in: operation.notificationIds },
              recipientId: userId
            },
            data: {
              isRead: true,
              readAt: new Date()
            }
          })
          break

        case 'delete':
          result = await prisma.notification.deleteMany({
            where: {
              id: { in: operation.notificationIds },
              recipientId: userId
            }
          })
          break

        default:
          throw new Error(`Unknown bulk operation: ${operation.action}`)
      }

      return {
        success: true,
        affectedCount: result.count
      }

    } catch (error) {
      console.error('Bulk operation error:', error)
      return {
        success: false,
        affectedCount: 0
      }
    }
  }

  /**
   * 清理過期通知
   */
  static async cleanupExpiredNotifications(): Promise<number> {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      })

      return result.count
    } catch (error) {
      console.error('Cleanup expired notifications error:', error)
      return 0
    }
  }

  /**
   * 創建事件通知
   */
  static async createEventNotification(
    eventId: number,
    type: 'created' | 'updated' | 'cancelled',
    additionalData?: any
  ): Promise<void> {
    try {
      // 獲取活動詳情
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          creator: {
            select: { displayName: true, firstName: true, lastName: true }
          }
        }
      })

      if (!event) return

      // 決定通知模板和接收者
      let template: NotificationTemplate
      let recipientType: 'all' | 'specific' | 'role_based' | 'grade_based' = 'all'

      switch (type) {
        case 'created':
          template = 'event_created'
          recipientType = event.targetGrades ? 'grade_based' : 'all'
          break
        case 'updated':
          template = 'event_updated'
          recipientType = 'all' // 發送給所有用戶或已報名用戶
          break
        case 'cancelled':
          template = 'event_cancelled'
          recipientType = 'all' // 發送給已報名用戶
          break
        default:
          return
      }

      // 發送通知
      await this.sendNotification({
        title: `活動${type === 'created' ? '建立' : type === 'updated' ? '更新' : '取消'}`,
        message: `活動「${event.title}」${type === 'created' ? '已建立' : type === 'updated' ? '已更新' : '已取消'}`,
        type: 'event',
        priority: type === 'cancelled' ? 'urgent' : 'medium',
        recipientType,
        targetGrades: event.targetGrades as string[],
        template,
        relatedId: eventId,
        relatedType: 'event'
      })

    } catch (error) {
      console.error('Create event notification error:', error)
    }
  }

  /**
   * 創建公告通知
   */
  static async createAnnouncementNotification(
    announcementId: number
  ): Promise<void> {
    try {
      const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        include: {
          author: {
            select: { displayName: true, firstName: true, lastName: true }
          }
        }
      })

      if (!announcement || announcement.status !== 'published') return

      await this.sendNotification({
        title: `新公告：${announcement.title}`,
        message: announcement.summary || announcement.content.substring(0, 100) + '...',
        type: 'announcement',
        priority: announcement.priority as NotificationPriority,
        recipientType: 'all', // 根據 targetAudience 決定
        template: 'announcement_published',
        relatedId: announcementId,
        relatedType: 'announcement'
      })

    } catch (error) {
      console.error('Create announcement notification error:', error)
    }
  }

  /**
   * 獲取用戶通知偏好
   */
  static async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      // 在實際應用中，這些偏好應該存儲在數據庫中
      // 這裡返回默認設定
      return DEFAULT_NOTIFICATION_PREFERENCES
    } catch (error) {
      console.error('Get user preferences error:', error)
      return DEFAULT_NOTIFICATION_PREFERENCES
    }
  }

  /**
   * 更新用戶通知偏好
   */
  static async updateUserPreferences(
    userId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    try {
      // TODO: 實作用戶偏好的數據庫存儲
      // 目前返回合併後的設定
      return {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...preferences
      }
    } catch (error) {
      console.error('Update user preferences error:', error)
      throw error
    }
  }

  /**
   * 創建報名通知
   */
  static async createRegistrationNotification(
    registrationId: number,
    type: 'confirmed' | 'waitlist' | 'cancelled'
  ): Promise<void> {
    try {
      const registration = await prisma.eventRegistration.findUnique({
        where: { id: registrationId },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              location: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              displayName: true
            }
          }
        }
      })

      if (!registration) return

      let template: NotificationTemplate
      let priority: NotificationPriority = 'medium'
      let title: string
      let message: string

      switch (type) {
        case 'confirmed':
          template = 'registration_confirmed'
          title = `報名確認：${registration.event.title}`
          message = `您已成功報名活動「${registration.event.title}」`
          break
        case 'waitlist':
          template = 'registration_waitlist'
          title = `候補名單：${registration.event.title}`
          message = `您已加入活動「${registration.event.title}」的候補名單`
          break
        case 'cancelled':
          template = 'registration_cancelled'
          title = `報名取消：${registration.event.title}`
          message = `您的報名「${registration.event.title}」已取消`
          break
        default:
          return
      }

      await this.sendNotification({
        title,
        message,
        type: 'registration',
        priority,
        recipientType: 'specific',
        recipientIds: [registration.userId],
        template,
        relatedId: registration.eventId,
        relatedType: 'event'
      })

    } catch (error) {
      console.error('Create registration notification error:', error)
    }
  }

  /**
   * 創建資源通知
   */
  static async createResourceNotification(
    resourceId: number
  ): Promise<void> {
    try {
      const resource = await prisma.resource.findUnique({
        where: { id: resourceId },
        include: {
          gradeLevel: {
            select: { name: true }
          },
          category: {
            select: { displayName: true }
          },
          creator: {
            select: { displayName: true }
          }
        }
      })

      if (!resource || resource.status !== 'published') return

      await this.sendNotification({
        title: `新資源：${resource.title}`,
        message: `新的教學資源「${resource.title}」已上傳${resource.gradeLevel ? `，適用於${resource.gradeLevel.name}` : ''}。`,
        type: 'resource',
        priority: 'low',
        recipientType: resource.gradeLevelId ? 'grade_based' : 'all',
        targetGrades: resource.gradeLevelId ? [resource.gradeLevel?.name || ''] : undefined,
        template: 'resource_uploaded',
        relatedId: resourceId,
        relatedType: 'resource'
      })

    } catch (error) {
      console.error('Create resource notification error:', error)
    }
  }

  /**
   * 創建電子報通知
   */
  static async createNewsletterNotification(
    newsletterId: number
  ): Promise<void> {
    try {
      const newsletter = await prisma.newsletter.findUnique({
        where: { id: newsletterId },
        include: {
          author: {
            select: { displayName: true }
          }
        }
      })

      if (!newsletter || newsletter.status !== 'published') return

      await this.sendNotification({
        title: `電子報${newsletter.issueNumber ? `第${newsletter.issueNumber}期` : ''}已發布`,
        message: `電子報「${newsletter.title}」已發布，點擊查看精彩內容。`,
        type: 'newsletter',
        priority: 'low',
        recipientType: 'all',
        template: 'newsletter_published',
        relatedId: newsletterId,
        relatedType: 'newsletter'
      })

    } catch (error) {
      console.error('Create newsletter notification error:', error)
    }
  }

  /**
   * 創建系統維護通知
   */
  static async createMaintenanceNotification(
    startTime: Date,
    endTime: Date,
    description?: string
  ): Promise<void> {
    try {
      await this.sendNotification({
        title: '系統維護通知',
        message: `系統將於${startTime.toLocaleString()}至${endTime.toLocaleString()}進行維護，期間服務可能暫停。${description ? ` ${description}` : ''}`,
        type: 'maintenance',
        priority: 'high',
        recipientType: 'all',
        template: 'system_maintenance',
        expiresAt: endTime.toISOString()
      })

    } catch (error) {
      console.error('Create maintenance notification error:', error)
    }
  }

  /**
   * 創建提醒通知
   */
  static async createReminderNotification(
    type: 'event' | 'deadline',
    relatedId: number,
    relatedType: string,
    title: string,
    message: string,
    recipientIds?: string[]
  ): Promise<void> {
    try {
      const template: NotificationTemplate = type === 'event' ? 'reminder_event' : 'reminder_deadline'
      
      await this.sendNotification({
        title: `提醒：${title}`,
        message,
        type: 'reminder',
        priority: 'medium',
        recipientType: recipientIds ? 'specific' : 'all',
        recipientIds,
        template,
        relatedId,
        relatedType
      })

    } catch (error) {
      console.error('Create reminder notification error:', error)
    }
  }

  /**
   * 批量創建活動提醒
   */
  static async createEventReminders(): Promise<void> {
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const dayAfterTomorrow = new Date(tomorrow)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

      // 獲取明天的活動
      const upcomingEvents = await prisma.event.findMany({
        where: {
          startDate: {
            gte: tomorrow,
            lt: dayAfterTomorrow
          },
          status: 'published'
        },
        include: {
          registrations: {
            where: {
              status: 'confirmed'
            },
            select: {
              userId: true
            }
          }
        }
      })

      // 為每個活動發送提醒
      for (const event of upcomingEvents) {
        const recipientIds = event.registrations.map(reg => reg.userId)
        
        if (recipientIds.length > 0) {
          await this.createReminderNotification(
            'event',
            event.id,
            'event',
            event.title,
            `提醒您，活動「${event.title}」將於明天舉行，請準時參加。`,
            recipientIds
          )
        }
      }

    } catch (error) {
      console.error('Create event reminders error:', error)
    }
  }

  /**
   * 私有方法：獲取通知接收者
   */
  private static async getRecipients(data: NotificationFormData): Promise<string[]> {
    let recipients: string[] = []

    switch (data.recipientType) {
      case 'all':
        const allUsers = await prisma.user.findMany({
          where: { isActive: true },
          select: { id: true }
        })
        recipients = allUsers.map(user => user.id)
        break

      case 'specific':
        recipients = data.recipientIds || []
        break

      case 'role_based':
        if (data.targetRoles && data.targetRoles.length > 0) {
          const roleUsers = await prisma.user.findMany({
            where: {
              isActive: true,
              userRoles: {
                some: {
                  role: {
                    name: { in: data.targetRoles }
                  }
                }
              }
            },
            select: { id: true }
          })
          recipients = roleUsers.map(user => user.id)
        }
        break

      case 'grade_based':
        if (data.targetGrades && data.targetGrades.length > 0) {
          // TODO: 實作基於年級的用戶篩選
          // 需要根據實際的用戶-年級關聯邏輯來實作
          const gradeUsers = await prisma.user.findMany({
            where: { isActive: true },
            select: { id: true }
          })
          recipients = gradeUsers.map(user => user.id)
        }
        break
    }

    return recipients
  }

  /**
   * 私有方法：檢查重複通知
   */
  private static async checkDuplicateNotifications(
    recipients: string[],
    title: string,
    type: NotificationType,
    relatedId?: number
  ): Promise<string[]> {
    const duplicates = await prisma.notification.findMany({
      where: {
        recipientId: { in: recipients },
        title,
        type,
        relatedId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24小時內
        }
      },
      select: { recipientId: true }
    })

    return duplicates.map(n => n.recipientId)
  }

  /**
   * 私有方法：應用通知模板
   */
  private static applyTemplate(template: string, data: any): string {
    let result = template

    // 基本變數替換
    Object.keys(data).forEach(key => {
      const value = data[key]
      if (typeof value === 'string' || typeof value === 'number') {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
      }
    })

    return result
  }

  /**
   * 私有方法：推送即時通知
   */
  private static async pushRealTimeNotifications(notifications: any[]): Promise<void> {
    try {
      // 群組通知按用戶
      const notificationsByUser = notifications.reduce((acc, notification) => {
        if (!acc[notification.recipientId]) {
          acc[notification.recipientId] = []
        }
        acc[notification.recipientId].push(notification)
        return acc
      }, {} as Record<string, any[]>)

      // 發送即時通知到 SSE 流
      for (const [userId, userNotifications] of Object.entries(notificationsByUser)) {
        try {
          // 調用 SSE 推送服務
          const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/stream`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userIds: [userId],
              notification: {
                type: 'new_notifications',
                data: userNotifications,
                count: userNotifications.length
              }
            })
          })

          if (response.ok) {
            console.log(`✅ Pushed ${userNotifications.length} real-time notifications to user ${userId}`)
          } else {
            console.warn(`⚠️ SSE push failed for user ${userId}:`, response.status)
          }
        } catch (error) {
          console.error(`❌ Failed to push notifications to user ${userId}:`, error)
        }
      }

    } catch (error) {
      console.error('Push real-time notifications error:', error)
    }
  }

  /**
   * 私有方法：發送 Email 通知
   */
  private static async sendEmailNotifications(notifications: any[]): Promise<void> {
    try {
      console.log(`Preparing to send ${notifications.length} email notifications`)
      
      // 群組通知按用戶
      const notificationsByUser = notifications.reduce((acc, notification) => {
        if (!acc[notification.recipientId]) {
          acc[notification.recipientId] = []
        }
        acc[notification.recipientId].push(notification)
        return acc
      }, {} as Record<string, any[]>)

      // 批量發送 Email
      for (const [userId, userNotifications] of Object.entries(notificationsByUser)) {
        try {
          // 獲取用戶偏好設定和基本資料
          const [preferences, user] = await Promise.all([
            this.getUserPreferences(userId),
            prisma.user.findUnique({
              where: { id: userId },
              select: { 
                id: true, 
                email: true, 
                firstName: true, 
                lastName: true, 
                displayName: true 
              }
            })
          ])

          if (!user?.email) {
            console.warn(`User ${userId} has no email address, skipping email notification`)
            continue
          }

          // 檢查用戶是否啟用 Email 通知
          if (!preferences.email) {
            console.log(`User ${userId} has email notifications disabled`)
            continue
          }

          // 發送不同類型的通知郵件
          for (const notification of userNotifications) {
            try {
              if (notification.type === 'announcement') {
                await emailService.sendAnnouncementEmail(
                  [user.email],
                  notification.title,
                  notification.message,
                  notification.priority
                )
              } else if (notification.type === 'event') {
                // 假設有活動日期在 metadata 中
                const eventDate = notification.metadata?.eventDate 
                  ? new Date(notification.metadata.eventDate) 
                  : new Date()
                
                await emailService.sendEventNotificationEmail(
                  [user.email],
                  notification.title,
                  eventDate,
                  notification.message
                )
              } else {
                // 其他類型的通知使用通用公告模板
                await emailService.sendAnnouncementEmail(
                  [user.email],
                  notification.title,
                  notification.message,
                  notification.priority
                )
              }

              console.log(`✅ Email sent successfully to ${user.email} for notification: ${notification.title}`)
            } catch (emailError) {
              console.error(`❌ Failed to send email to ${user.email}:`, emailError)
            }
          }
        } catch (userError) {
          console.error(`Error processing notifications for user ${userId}:`, userError)
        }
      }

    } catch (error) {
      console.error('Send email notifications error:', error)
    }
  }

  /**
   * 獲取通知模板
   */
  static getTemplate(templateId: NotificationTemplate): NotificationTemplateConfig {
    return NOTIFICATION_TEMPLATES[templateId]
  }

  /**
   * 獲取所有可用的通知模板
   */
  static getAllTemplates(): NotificationTemplateConfig[] {
    return Object.values(NOTIFICATION_TEMPLATES)
  }
}

export default NotificationService