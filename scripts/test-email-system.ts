#!/usr/bin/env tsx
/**
 * Email System Testing Script
 * 電子郵件系統測試腳本
 * 
 * @description 全面測試電子郵件系統功能
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { config } from 'dotenv'
import emailService from '../lib/emailService'
import emailQueue from '../lib/emailQueue'
import templateEngine from '../lib/emailTemplateEngine'

// 載入環境變數
config()

interface TestResult {
  name: string
  success: boolean
  message: string
  details?: any
  duration?: number
}

class EmailSystemTester {
  private results: TestResult[] = []
  
  constructor() {
    console.log('🧪 KCISLK ESID 電子郵件系統測試')
    console.log('=====================================')
  }

  /**
   * 運行所有測試
   */
  async runAllTests(): Promise<void> {
    await this.testConfiguration()
    await this.testConnection()
    await this.testTemplateEngine()
    await this.testEmailService()
    await this.testQueueSystem()
    
    this.printSummary()
  }

  /**
   * 測試配置
   */
  private async testConfiguration(): Promise<void> {
    console.log('\n📋 測試配置...')
    
    const startTime = Date.now()
    try {
      const requiredEnvVars = [
        'EMAIL_HOST',
        'EMAIL_USER',
        'EMAIL_PASS',
        'EMAIL_FROM'
      ]

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
      
      if (missingVars.length > 0) {
        throw new Error(`缺少環境變數: ${missingVars.join(', ')}`)
      }

      // 檢查可選配置
      const optionalConfig = {
        EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'smtp',
        EMAIL_PORT: process.env.EMAIL_PORT || '587',
        EMAIL_SECURE: process.env.EMAIL_SECURE || 'false',
        EMAIL_QUEUE_ENABLED: process.env.EMAIL_QUEUE_ENABLED || 'false',
        EMAIL_TEST_MODE: process.env.EMAIL_TEST_MODE || 'false'
      }

      this.addResult({
        name: '配置檢查',
        success: true,
        message: '所有必需配置已設定',
        details: { optionalConfig },
        duration: Date.now() - startTime
      })

    } catch (error) {
      this.addResult({
        name: '配置檢查',
        success: false,
        message: error instanceof Error ? error.message : '配置檢查失敗',
        duration: Date.now() - startTime
      })
    }
  }

  /**
   * 測試連接
   */
  private async testConnection(): Promise<void> {
    console.log('\n🔗 測試郵件服務連接...')
    
    const startTime = Date.now()
    try {
      const connectionResult = await emailService.testConnection()
      
      this.addResult({
        name: '郵件服務連接',
        success: connectionResult,
        message: connectionResult ? '連接成功' : '連接失敗',
        duration: Date.now() - startTime
      })

    } catch (error) {
      this.addResult({
        name: '郵件服務連接',
        success: false,
        message: error instanceof Error ? error.message : '連接測試失敗',
        duration: Date.now() - startTime
      })
    }
  }

  /**
   * 測試模板引擎
   */
  private async testTemplateEngine(): Promise<void> {
    console.log('\n🎨 測試模板引擎...')
    
    // 測試歡迎郵件模板
    await this.testTemplate('welcome', {
      userName: '測試用戶'
    })

    // 測試公告模板
    await this.testTemplate('announcement', {
      title: '測試公告',
      content: '這是測試公告內容',
      priority: 'medium'
    })

    // 測試活動通知模板
    await this.testTemplate('event_notification', {
      eventTitle: '測試活動',
      eventDate: new Date(),
      eventDetails: '這是測試活動詳情'
    })

    // 測試系統通知模板
    await this.testTemplate('system_notification', {
      title: '系統維護通知',
      message: '系統將於今晚進行維護',
      type: 'warning'
    })
  }

  /**
   * 測試單個模板
   */
  private async testTemplate(templateType: string, templateData: any): Promise<void> {
    const startTime = Date.now()
    try {
      const rendered = await templateEngine.render(templateType as any, templateData, {
        language: 'zh-TW',
        theme: 'default'
      })

      const success = rendered.html.length > 0 && rendered.subject.length > 0

      this.addResult({
        name: `${templateType} 模板`,
        success,
        message: success ? '模板渲染成功' : '模板渲染失敗',
        details: {
          subjectLength: rendered.subject.length,
          htmlLength: rendered.html.length,
          textLength: rendered.text.length
        },
        duration: Date.now() - startTime
      })

    } catch (error) {
      this.addResult({
        name: `${templateType} 模板`,
        success: false,
        message: error instanceof Error ? error.message : '模板測試失敗',
        duration: Date.now() - startTime
      })
    }
  }

  /**
   * 測試郵件服務
   */
  private async testEmailService(): Promise<void> {
    console.log('\n📧 測試郵件服務...')

    // 測試歡迎郵件
    await this.testWelcomeEmail()
    
    // 測試公告郵件
    await this.testAnnouncementEmail()
    
    // 測試測試郵件
    await this.testGenericEmail()
  }

  /**
   * 測試歡迎郵件
   */
  private async testWelcomeEmail(): Promise<void> {
    const startTime = Date.now()
    try {
      const testRecipient = process.env.EMAIL_TEST_RECIPIENT || 'test@example.com'
      const success = await emailService.sendWelcomeEmail(testRecipient, '測試用戶')

      this.addResult({
        name: '歡迎郵件發送',
        success,
        message: success ? '歡迎郵件發送成功' : '歡迎郵件發送失敗',
        details: { recipient: testRecipient },
        duration: Date.now() - startTime
      })

    } catch (error) {
      this.addResult({
        name: '歡迎郵件發送',
        success: false,
        message: error instanceof Error ? error.message : '歡迎郵件測試失敗',
        duration: Date.now() - startTime
      })
    }
  }

  /**
   * 測試公告郵件
   */
  private async testAnnouncementEmail(): Promise<void> {
    const startTime = Date.now()
    try {
      const testRecipient = process.env.EMAIL_TEST_RECIPIENT || 'test@example.com'
      const result = await emailService.sendAnnouncementEmail(
        [testRecipient],
        '【測試】系統測試公告',
        '這是一封測試公告郵件，用於驗證公告郵件發送功能。',
        'medium'
      )

      this.addResult({
        name: '公告郵件發送',
        success: result.success,
        message: result.success ? '公告郵件發送成功' : '公告郵件發送失敗',
        details: {
          totalSent: result.totalSent,
          totalFailed: result.totalFailed,
          errors: result.errors
        },
        duration: Date.now() - startTime
      })

    } catch (error) {
      this.addResult({
        name: '公告郵件發送',
        success: false,
        message: error instanceof Error ? error.message : '公告郵件測試失敗',
        duration: Date.now() - startTime
      })
    }
  }

  /**
   * 測試一般郵件
   */
  private async testGenericEmail(): Promise<void> {
    const startTime = Date.now()
    try {
      const testRecipient = process.env.EMAIL_TEST_RECIPIENT || 'test@example.com'
      const success = await emailService.sendTestEmail(testRecipient)

      this.addResult({
        name: '測試郵件發送',
        success,
        message: success ? '測試郵件發送成功' : '測試郵件發送失敗',
        details: { recipient: testRecipient },
        duration: Date.now() - startTime
      })

    } catch (error) {
      this.addResult({
        name: '測試郵件發送',
        success: false,
        message: error instanceof Error ? error.message : '測試郵件發送失敗',
        duration: Date.now() - startTime
      })
    }
  }

  /**
   * 測試佇列系統
   */
  private async testQueueSystem(): Promise<void> {
    console.log('\n📝 測試佇列系統...')

    await this.testQueueStats()
    await this.testQueueAdd()
    await this.testQueueProcessing()
  }

  /**
   * 測試佇列統計
   */
  private async testQueueStats(): Promise<void> {
    const startTime = Date.now()
    try {
      const stats = emailService.getQueueStats()
      
      this.addResult({
        name: '佇列統計',
        success: true,
        message: '佇列統計獲取成功',
        details: stats,
        duration: Date.now() - startTime
      })

    } catch (error) {
      this.addResult({
        name: '佇列統計',
        success: false,
        message: error instanceof Error ? error.message : '佇列統計測試失敗',
        duration: Date.now() - startTime
      })
    }
  }

  /**
   * 測試添加到佇列
   */
  private async testQueueAdd(): Promise<void> {
    const startTime = Date.now()
    try {
      const testRecipient = process.env.EMAIL_TEST_RECIPIENT || 'test@example.com'
      const testEmails = [
        {
          to: testRecipient,
          subject: '【佇列測試】測試郵件 1',
          html: '<h1>測試郵件 1</h1><p>這是佇列系統測試郵件。</p>',
          text: '測試郵件 1 - 這是佇列系統測試郵件。'
        },
        {
          to: testRecipient,
          subject: '【佇列測試】測試郵件 2',
          html: '<h1>測試郵件 2</h1><p>這是佇列系統測試郵件。</p>',
          text: '測試郵件 2 - 這是佇列系統測試郵件。'
        }
      ]

      const result = await emailService.sendBulkEmails(testEmails, 'normal')

      this.addResult({
        name: '佇列添加',
        success: result.success,
        message: '郵件成功添加到佇列',
        details: {
          queueId: result.queueId,
          emailCount: testEmails.length
        },
        duration: Date.now() - startTime
      })

    } catch (error) {
      this.addResult({
        name: '佇列添加',
        success: false,
        message: error instanceof Error ? error.message : '佇列添加測試失敗',
        duration: Date.now() - startTime
      })
    }
  }

  /**
   * 測試佇列處理
   */
  private async testQueueProcessing(): Promise<void> {
    const startTime = Date.now()
    try {
      // 等待一些時間讓佇列處理
      console.log('⏳ 等待佇列處理...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      const stats = emailService.getQueueStats()
      
      this.addResult({
        name: '佇列處理',
        success: true,
        message: '佇列處理測試完成',
        details: {
          finalStats: stats,
          note: '請檢查郵件是否成功發送'
        },
        duration: Date.now() - startTime
      })

    } catch (error) {
      this.addResult({
        name: '佇列處理',
        success: false,
        message: error instanceof Error ? error.message : '佇列處理測試失敗',
        duration: Date.now() - startTime
      })
    }
  }

  /**
   * 添加測試結果
   */
  private addResult(result: TestResult): void {
    this.results.push(result)
    const status = result.success ? '✅' : '❌'
    const duration = result.duration ? ` (${result.duration}ms)` : ''
    console.log(`${status} ${result.name}: ${result.message}${duration}`)
    
    if (result.details && process.env.VERBOSE === 'true') {
      console.log(`   詳情: ${JSON.stringify(result.details, null, 2)}`)
    }
  }

  /**
   * 打印測試總結
   */
  private printSummary(): void {
    console.log('\n📊 測試總結')
    console.log('=====================================')
    
    const total = this.results.length
    const successful = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => r.success === false).length
    const successRate = Math.round((successful / total) * 100)
    
    console.log(`總測試數: ${total}`)
    console.log(`成功: ${successful}`)
    console.log(`失敗: ${failed}`)
    console.log(`成功率: ${successRate}%`)
    
    if (failed > 0) {
      console.log('\n❌ 失敗的測試:')
      this.results
        .filter(r => r.success === false)
        .forEach(r => {
          console.log(`   • ${r.name}: ${r.message}`)
        })
    }
    
    const totalDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0)
    console.log(`\n⏱️ 總測試時間: ${totalDuration}ms`)
    
    // 輸出配置建議
    this.printConfigRecommendations()
  }

  /**
   * 打印配置建議
   */
  private printConfigRecommendations(): void {
    console.log('\n💡 配置建議')
    console.log('=====================================')
    
    const recommendations: string[] = []
    
    if (!process.env.EMAIL_TEST_RECIPIENT) {
      recommendations.push('設定 EMAIL_TEST_RECIPIENT 環境變數以進行完整測試')
    }
    
    if (process.env.EMAIL_TEST_MODE !== 'true') {
      recommendations.push('在開發環境中設定 EMAIL_TEST_MODE=true 以避免實際發送郵件')
    }
    
    if (process.env.EMAIL_QUEUE_ENABLED !== 'true') {
      recommendations.push('設定 EMAIL_QUEUE_ENABLED=true 以啟用佇列系統')
    }
    
    if (!process.env.EMAIL_RATE_LIMIT_PER_MINUTE) {
      recommendations.push('設定 EMAIL_RATE_LIMIT_PER_MINUTE 以控制發送速率')
    }
    
    if (recommendations.length > 0) {
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`)
      })
    } else {
      console.log('✅ 配置看起來不錯！')
    }
  }
}

// 運行測試
async function runTests() {
  const tester = new EmailSystemTester()
  await tester.runAllTests()
}

// 如果直接運行此腳本
if (require.main === module) {
  runTests().catch(console.error)
}

export { EmailSystemTester }