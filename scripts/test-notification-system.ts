/**
 * Notification System Test Script
 * 通知系統測試腳本
 * 
 * @description 測試通知系統的各項功能，包括 API 端點、服務層和業務整合
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { PrismaClient } from '@prisma/client'
import NotificationService from '../lib/notificationService'
import { NotificationFormData, NotificationTemplate } from '../lib/types'

const prisma = new PrismaClient()

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  message?: string
  data?: any
}

class NotificationSystemTester {
  private results: TestResult[] = []
  private testUserId: string = ''

  async runAllTests(): Promise<void> {
    console.log('🔄 Starting Notification System Tests...\n')

    try {
      // 準備測試環境
      await this.setupTestEnvironment()

      // 執行測試
      await this.testNotificationService()
      await this.testNotificationTemplates()
      await this.testBulkOperations()
      await this.testBusinessIntegrations()
      await this.testNotificationPreferences()
      await this.testCleanupFunctions()

      // 清理測試環境
      await this.cleanupTestEnvironment()

      // 顯示結果
      this.displayResults()

    } catch (error) {
      console.error('❌ Test execution failed:', error)
    } finally {
      await prisma.$disconnect()
    }
  }

  private async setupTestEnvironment(): Promise<void> {
    console.log('🚀 Setting up test environment...')

    try {
      // 創建測試用戶
      const testUser = await prisma.user.create({
        data: {
          id: `test-user-${Date.now()}`,
          email: `test-notification-${Date.now()}@example.com`,
          displayName: 'Test User for Notifications',
          firstName: 'Test',
          lastName: 'User',
          isActive: true,
          emailVerified: true
        }
      })

      this.testUserId = testUser.id
      this.addResult('Setup Test Environment', 'PASS', 'Test user created successfully')

    } catch (error) {
      this.addResult('Setup Test Environment', 'FAIL', `Failed to create test user: ${error}`)
      throw error
    }
  }

  private async testNotificationService(): Promise<void> {
    console.log('📧 Testing NotificationService...')

    // 測試基本通知發送
    try {
      const notificationData: NotificationFormData = {
        title: 'Test Notification',
        message: 'This is a test notification message',
        type: 'system',
        priority: 'medium',
        recipientType: 'specific',
        recipientIds: [this.testUserId],
        template: 'announcement_published'
      }

      const result = await NotificationService.sendNotification(notificationData)

      if (result.success && result.totalSent === 1) {
        this.addResult('Send Notification', 'PASS', 'Notification sent successfully', result)
      } else {
        this.addResult('Send Notification', 'FAIL', 'Failed to send notification', result)
      }

    } catch (error) {
      this.addResult('Send Notification', 'FAIL', `Error: ${error}`)
    }

    // 測試通知去重
    try {
      const duplicateData: NotificationFormData = {
        title: 'Test Notification', // 相同標題
        message: 'This is a duplicate test notification',
        type: 'system',
        priority: 'medium',
        recipientType: 'specific',
        recipientIds: [this.testUserId]
      }

      const result = await NotificationService.sendNotification(duplicateData)
      
      // 檢查是否正確處理重複通知
      if (result.success && result.totalSent === 0) {
        this.addResult('Notification Deduplication', 'PASS', 'Duplicate notification prevented')
      } else {
        this.addResult('Notification Deduplication', 'FAIL', 'Duplicate notification not prevented', result)
      }

    } catch (error) {
      this.addResult('Notification Deduplication', 'FAIL', `Error: ${error}`)
    }
  }

  private async testNotificationTemplates(): Promise<void> {
    console.log('📝 Testing Notification Templates...')

    try {
      // 測試獲取所有模板
      const allTemplates = NotificationService.getAllTemplates()
      
      if (allTemplates.length === 12) {
        this.addResult('Get All Templates', 'PASS', `Found ${allTemplates.length} templates`)
      } else {
        this.addResult('Get All Templates', 'FAIL', `Expected 12 templates, found ${allTemplates.length}`)
      }

      // 測試單一模板獲取
      const template = NotificationService.getTemplate('event_created')
      
      if (template && template.id === 'event_created') {
        this.addResult('Get Single Template', 'PASS', 'Template retrieved successfully')
      } else {
        this.addResult('Get Single Template', 'FAIL', 'Failed to retrieve template')
      }

      // 測試模板變數替換
      const testData = {
        title: 'Test Event',
        startDate: '2024-01-15',
        location: 'Test Location'
      }

      const appliedTemplate = NotificationService['applyTemplate'](
        'New event: {{title}} on {{startDate}} at {{location}}',
        testData
      )

      const expectedOutput = 'New event: Test Event on 2024-01-15 at Test Location'
      
      if (appliedTemplate === expectedOutput) {
        this.addResult('Template Variable Replacement', 'PASS', 'Variables replaced correctly')
      } else {
        this.addResult('Template Variable Replacement', 'FAIL', `Expected: ${expectedOutput}, Got: ${appliedTemplate}`)
      }

    } catch (error) {
      this.addResult('Test Templates', 'FAIL', `Error: ${error}`)
    }
  }

  private async testBulkOperations(): Promise<void> {
    console.log('📦 Testing Bulk Operations...')

    try {
      // 先創建一些測試通知
      const notifications = await this.createTestNotifications(3)
      const notificationIds = notifications.map(n => n.id)

      // 測試批量標記為已讀
      const bulkResult = await NotificationService.bulkOperation(this.testUserId, {
        action: 'mark_read',
        notificationIds
      })

      if (bulkResult.success && bulkResult.affectedCount === 3) {
        this.addResult('Bulk Mark Read', 'PASS', `Marked ${bulkResult.affectedCount} notifications as read`)
      } else {
        this.addResult('Bulk Mark Read', 'FAIL', 'Bulk mark read operation failed', bulkResult)
      }

      // 測試批量刪除
      const deleteResult = await NotificationService.bulkOperation(this.testUserId, {
        action: 'delete',
        notificationIds
      })

      if (deleteResult.success && deleteResult.affectedCount === 3) {
        this.addResult('Bulk Delete', 'PASS', `Deleted ${deleteResult.affectedCount} notifications`)
      } else {
        this.addResult('Bulk Delete', 'FAIL', 'Bulk delete operation failed', deleteResult)
      }

    } catch (error) {
      this.addResult('Bulk Operations', 'FAIL', `Error: ${error}`)
    }
  }

  private async testBusinessIntegrations(): Promise<void> {
    console.log('🔗 Testing Business Integrations...')

    try {
      // 測試活動通知
      const testEvent = await this.createTestEvent()
      
      await NotificationService.createEventNotification(testEvent.id, 'created')
      
      // 檢查是否創建了通知
      const eventNotifications = await prisma.notification.findMany({
        where: {
          relatedId: testEvent.id,
          relatedType: 'event',
          type: 'event'
        }
      })

      if (eventNotifications.length > 0) {
        this.addResult('Event Notification Integration', 'PASS', 'Event notification created successfully')
      } else {
        this.addResult('Event Notification Integration', 'FAIL', 'No event notification created')
      }

      // 測試公告通知
      const testAnnouncement = await this.createTestAnnouncement()
      
      await NotificationService.createAnnouncementNotification(testAnnouncement.id)
      
      const announcementNotifications = await prisma.notification.findMany({
        where: {
          relatedId: testAnnouncement.id,
          relatedType: 'announcement',
          type: 'announcement'
        }
      })

      if (announcementNotifications.length > 0) {
        this.addResult('Announcement Notification Integration', 'PASS', 'Announcement notification created successfully')
      } else {
        this.addResult('Announcement Notification Integration', 'FAIL', 'No announcement notification created')
      }

    } catch (error) {
      this.addResult('Business Integrations', 'FAIL', `Error: ${error}`)
    }
  }

  private async testNotificationPreferences(): Promise<void> {
    console.log('⚙️ Testing Notification Preferences...')

    try {
      // 測試獲取默認偏好
      const defaultPrefs = await NotificationService.getUserPreferences(this.testUserId)
      
      if (defaultPrefs && defaultPrefs.email && defaultPrefs.system) {
        this.addResult('Get User Preferences', 'PASS', 'Default preferences retrieved')
      } else {
        this.addResult('Get User Preferences', 'FAIL', 'Failed to get default preferences')
      }

      // 測試更新偏好
      const updatedPrefs = await NotificationService.updateUserPreferences(this.testUserId, {
        email: false,
        system: true
      })

      if (updatedPrefs && !updatedPrefs.email && updatedPrefs.system) {
        this.addResult('Update User Preferences', 'PASS', 'Preferences updated successfully')
      } else {
        this.addResult('Update User Preferences', 'FAIL', 'Failed to update preferences')
      }

    } catch (error) {
      this.addResult('Notification Preferences', 'FAIL', `Error: ${error}`)
    }
  }

  private async testCleanupFunctions(): Promise<void> {
    console.log('🧹 Testing Cleanup Functions...')

    try {
      // 創建過期通知
      const expiredNotification = await prisma.notification.create({
        data: {
          recipientId: this.testUserId,
          title: 'Expired Test Notification',
          message: 'This notification should be cleaned up',
          type: 'system',
          priority: 'low',
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 昨天過期
        }
      })

      // 測試清理過期通知
      const cleanedCount = await NotificationService.cleanupExpiredNotifications()

      if (cleanedCount >= 1) {
        this.addResult('Cleanup Expired Notifications', 'PASS', `Cleaned up ${cleanedCount} expired notifications`)
      } else {
        this.addResult('Cleanup Expired Notifications', 'FAIL', 'No expired notifications cleaned up')
      }

    } catch (error) {
      this.addResult('Cleanup Functions', 'FAIL', `Error: ${error}`)
    }
  }

  private async createTestNotifications(count: number): Promise<any[]> {
    const notifications = []
    
    for (let i = 0; i < count; i++) {
      const notification = await prisma.notification.create({
        data: {
          recipientId: this.testUserId,
          title: `Test Notification ${i + 1}`,
          message: `This is test notification number ${i + 1}`,
          type: 'system',
          priority: 'low'
        }
      })
      notifications.push(notification)
    }

    return notifications
  }

  private async createTestEvent(): Promise<any> {
    return await prisma.event.create({
      data: {
        title: 'Test Event for Notifications',
        description: 'This is a test event for notification testing',
        eventType: 'academic',
        startDate: new Date('2024-01-15'),
        location: 'Test Location',
        registrationRequired: false,
        status: 'published',
        createdBy: this.testUserId
      }
    })
  }

  private async createTestAnnouncement(): Promise<any> {
    return await prisma.announcement.create({
      data: {
        title: 'Test Announcement for Notifications',
        content: 'This is a test announcement for notification testing',
        targetAudience: 'all',
        priority: 'medium',
        status: 'published',
        authorId: this.testUserId,
        publishedAt: new Date()
      }
    })
  }

  private async cleanupTestEnvironment(): Promise<void> {
    console.log('🧹 Cleaning up test environment...')

    try {
      // 刪除測試通知
      await prisma.notification.deleteMany({
        where: {
          recipientId: this.testUserId
        }
      })

      // 刪除測試活動
      await prisma.event.deleteMany({
        where: {
          createdBy: this.testUserId
        }
      })

      // 刪除測試公告
      await prisma.announcement.deleteMany({
        where: {
          authorId: this.testUserId
        }
      })

      // 刪除測試用戶
      await prisma.user.delete({
        where: {
          id: this.testUserId
        }
      })

      this.addResult('Cleanup Test Environment', 'PASS', 'Test environment cleaned up successfully')

    } catch (error) {
      this.addResult('Cleanup Test Environment', 'FAIL', `Failed to cleanup: ${error}`)
    }
  }

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message?: string, data?: any): void {
    this.results.push({ test, status, message, data })
  }

  private displayResults(): void {
    console.log('\n' + '='.repeat(80))
    console.log('📊 NOTIFICATION SYSTEM TEST RESULTS')
    console.log('='.repeat(80))

    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const skipped = this.results.filter(r => r.status === 'SKIP').length

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️'
      console.log(`${icon} ${result.test}: ${result.status}`)
      if (result.message) {
        console.log(`   └─ ${result.message}`)
      }
    })

    console.log('\n' + '-'.repeat(80))
    console.log(`📈 Total: ${this.results.length} | ✅ Passed: ${passed} | ❌ Failed: ${failed} | ⏭️ Skipped: ${skipped}`)
    console.log(`📊 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`)
    console.log('='.repeat(80))

    if (failed === 0) {
      console.log('🎉 All tests passed! Notification system is working correctly.')
    } else {
      console.log('⚠️ Some tests failed. Please review the failed tests above.')
    }
  }
}

// 執行測試
if (require.main === module) {
  const tester = new NotificationSystemTester()
  tester.runAllTests().catch(console.error)
}

export default NotificationSystemTester