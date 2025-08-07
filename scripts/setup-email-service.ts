#!/usr/bin/env tsx
/**
 * Email Service Setup Script
 * 電子郵件服務設置腳本
 * 
 * @description 自動設置和配置電子郵件服務
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

import { config } from 'dotenv'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import emailService from '../lib/emailService'

// 載入環境變數
config()

class EmailServiceSetup {
  constructor() {
    console.log('📧 KCISLK ESID 電子郵件服務設置')
    console.log('=====================================')
  }

  /**
   * 運行完整設置流程
   */
  async runSetup(): Promise<void> {
    console.log('🚀 開始設置電子郵件服務...\n')
    
    await this.checkEnvironmentVariables()
    await this.createEnvironmentTemplate()
    await this.testEmailConnection()
    await this.displayConfiguration()
    await this.showNextSteps()
    
    console.log('\n✅ 電子郵件服務設置完成！')
  }

  /**
   * 檢查環境變數
   */
  private async checkEnvironmentVariables(): Promise<void> {
    console.log('1️⃣ 檢查環境變數配置...')
    
    const requiredVars = [
      'EMAIL_HOST',
      'EMAIL_USER',
      'EMAIL_PASS',
      'EMAIL_FROM'
    ]

    const optionalVars = [
      'EMAIL_PROVIDER',
      'EMAIL_PORT',
      'EMAIL_SECURE',
      'EMAIL_FROM_NAME',
      'EMAIL_QUEUE_ENABLED',
      'EMAIL_TEST_MODE',
      'EMAIL_TEST_RECIPIENT'
    ]

    console.log('\n📋 必需環境變數:')
    let missingRequired = []
    
    for (const varName of requiredVars) {
      const value = process.env[varName]
      if (value) {
        console.log(`   ✅ ${varName}: ${this.maskSensitive(varName, value)}`)
      } else {
        console.log(`   ❌ ${varName}: 未設定`)
        missingRequired.push(varName)
      }
    }

    console.log('\n📋 可選環境變數:')
    for (const varName of optionalVars) {
      const value = process.env[varName]
      if (value) {
        console.log(`   ✅ ${varName}: ${this.maskSensitive(varName, value)}`)
      } else {
        console.log(`   ⚪ ${varName}: 使用默認值`)
      }
    }

    if (missingRequired.length > 0) {
      console.log(`\n⚠️ 警告: 缺少必需環境變數: ${missingRequired.join(', ')}`)
      console.log('請參考 .env.example 文件設置這些變數。\n')
    } else {
      console.log('\n✅ 所有必需環境變數已設定\n')
    }
  }

  /**
   * 創建環境變數模板
   */
  private async createEnvironmentTemplate(): Promise<void> {
    console.log('2️⃣ 創建環境變數模板...')
    
    const envExamplePath = join(process.cwd(), '.env.example')
    const envPath = join(process.cwd(), '.env')
    const envDevPath = join(process.cwd(), '.env.local')

    if (!existsSync(envPath) && !existsSync(envDevPath)) {
      console.log('   📄 創建 .env.local 模板文件...')
      
      const template = `# KCISLK ESID Email Service Configuration
# 複製自 .env.example 並填入實際配置值

# ==========================================
# EMAIL SERVICE CONFIGURATION | 電子郵件服務配置
# ==========================================

# Email Service Provider (smtp, gmail, sendgrid, aws-ses)
EMAIL_PROVIDER="smtp"

# SMTP Configuration (通用 SMTP 配置)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Email Settings (郵件設定)
EMAIL_FROM="noreply@kcislk.ntpc.edu.tw"
EMAIL_FROM_NAME="KCISLK ESID Info Hub"

# Email Queue Configuration (郵件佇列配置)
EMAIL_QUEUE_ENABLED="true"
EMAIL_QUEUE_BATCH_SIZE="10"
EMAIL_QUEUE_DELAY="1000"
EMAIL_RETRY_ATTEMPTS="3"

# Email Rate Limiting (郵件速率限制)
EMAIL_RATE_LIMIT_PER_MINUTE="60"
EMAIL_RATE_LIMIT_PER_HOUR="1000"

# Email Testing (郵件測試)
EMAIL_TEST_MODE="true"
EMAIL_TEST_RECIPIENT="test@example.com"

# ==========================================
# 其他環境變數保持不變...
# ==========================================
`
      
      try {
        writeFileSync(envDevPath, template)
        console.log('   ✅ 已創建 .env.local 模板文件')
        console.log('   📝 請編輯此文件並填入您的實際郵件配置')
      } catch (error) {
        console.log('   ❌ 創建模板文件失敗:', error)
      }
    } else {
      console.log('   ✅ 環境文件已存在')
    }
    
    console.log()
  }

  /**
   * 測試郵件連接
   */
  private async testEmailConnection(): Promise<void> {
    console.log('3️⃣ 測試郵件服務連接...')
    
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      console.log('   ⚠️ 跳過連接測試 - 郵件配置不完整')
      console.log('   📝 請先配置郵件設定後再運行測試')
      console.log()
      return
    }

    try {
      console.log('   🔍 正在測試連接...')
      const connectionResult = await emailService.testConnection()
      
      if (connectionResult) {
        console.log('   ✅ 郵件服務連接成功')
        
        // 如果有測試收件人，發送測試郵件
        if (process.env.EMAIL_TEST_RECIPIENT) {
          console.log('   📧 發送測試郵件...')
          const testResult = await emailService.sendTestEmail()
          
          if (testResult) {
            console.log('   ✅ 測試郵件發送成功')
            console.log(`   📬 請查收 ${process.env.EMAIL_TEST_RECIPIENT} 的測試郵件`)
          } else {
            console.log('   ❌ 測試郵件發送失敗')
          }
        }
      } else {
        console.log('   ❌ 郵件服務連接失敗')
        console.log('   💡 請檢查郵件配置是否正確')
      }
    } catch (error) {
      console.log('   ❌ 連接測試出錯:', error instanceof Error ? error.message : '未知錯誤')
    }
    
    console.log()
  }

  /**
   * 顯示當前配置
   */
  private async displayConfiguration(): Promise<void> {
    console.log('4️⃣ 當前郵件服務配置:')
    
    const config = {
      provider: process.env.EMAIL_PROVIDER || 'smtp',
      host: process.env.EMAIL_HOST || '未設定',
      port: process.env.EMAIL_PORT || '587',
      secure: process.env.EMAIL_SECURE === 'true' ? '是' : '否',
      from: process.env.EMAIL_FROM || '未設定',
      fromName: process.env.EMAIL_FROM_NAME || 'KCISLK ESID Info Hub',
      queueEnabled: process.env.EMAIL_QUEUE_ENABLED === 'true' ? '啟用' : '停用',
      testMode: process.env.EMAIL_TEST_MODE === 'true' ? '啟用' : '停用',
      rateLimitPerMinute: process.env.EMAIL_RATE_LIMIT_PER_MINUTE || '60',
      rateLimitPerHour: process.env.EMAIL_RATE_LIMIT_PER_HOUR || '1000'
    }

    console.log('   📊 服務配置:')
    Object.entries(config).forEach(([key, value]) => {
      const displayKey = key
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .replace(/^./, str => str.toUpperCase())
      console.log(`   • ${displayKey}: ${value}`)
    })
    
    console.log()
  }

  /**
   * 顯示下一步操作
   */
  private async showNextSteps(): Promise<void> {
    console.log('5️⃣ 下一步操作指南:')
    console.log()

    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      console.log('   📝 配置郵件設定:')
      console.log('   1. 編輯 .env.local 文件')
      console.log('   2. 填入您的 SMTP 服務器設定')
      console.log('   3. 設定發件人郵件地址')
      console.log('   4. 重新運行此腳本進行測試')
      console.log()
    }

    console.log('   🧪 運行完整測試:')
    console.log('   npm run test:email-system')
    console.log('   或')
    console.log('   tsx scripts/test-email-system.ts')
    console.log()

    console.log('   🚀 啟動開發服務器:')
    console.log('   npm run dev')
    console.log()

    console.log('   🔧 訪問管理界面:')
    console.log('   http://localhost:3000/admin (需要管理員權限)')
    console.log('   • 電子郵件管理標籤')
    console.log('   • 測試郵件發送功能')
    console.log('   • 查看佇列統計')
    console.log()

    console.log('   📚 常用API端點:')
    console.log('   • GET  /api/email/send - 獲取服務狀態')
    console.log('   • POST /api/email/send - 發送郵件')
    console.log('   • POST /api/email/test - 運行測試')
    console.log('   • GET  /api/email/preferences - 用戶偏好設定')
    console.log()

    console.log('   ⚙️ 生產環境配置:')
    console.log('   1. 在 Zeabur 控制台設置環境變數')
    console.log('   2. 關閉測試模式 (EMAIL_TEST_MODE=false)')
    console.log('   3. 配置真實的 SMTP 服務器')
    console.log('   4. 設置適當的速率限制')
    console.log()

    if (process.env.EMAIL_TEST_MODE === 'true') {
      console.log('   ⚠️ 注意: 當前為測試模式，郵件不會實際發送')
      console.log('   💡 生產環境請設定 EMAIL_TEST_MODE=false')
      console.log()
    }
  }

  /**
   * 遮蔽敏感信息
   */
  private maskSensitive(key: string, value: string): string {
    if (key.includes('PASS') || key.includes('SECRET') || key.includes('KEY')) {
      return value.length > 4 ? 
        value.substring(0, 4) + '*'.repeat(value.length - 4) : 
        '*'.repeat(value.length)
    }
    if (key.includes('USER') || key.includes('EMAIL')) {
      const atIndex = value.indexOf('@')
      if (atIndex > 1) {
        return value.substring(0, 2) + '*'.repeat(atIndex - 2) + value.substring(atIndex)
      }
    }
    return value
  }
}

// Gmail 設定指南
function showGmailSetupGuide(): void {
  console.log('📧 Gmail 設定指南:')
  console.log('=====================================')
  console.log()
  console.log('1. 啟用兩步驟驗證:')
  console.log('   • 前往 Google 帳戶設定')
  console.log('   • 啟用兩步驟驗證')
  console.log()
  console.log('2. 生成應用程式密碼:')
  console.log('   • 在 Google 帳戶中選擇「應用程式密碼」')
  console.log('   • 選擇「郵件」和「其他裝置」')
  console.log('   • 複製生成的 16 位密碼')
  console.log()
  console.log('3. 環境變數設定:')
  console.log('   EMAIL_PROVIDER="gmail"')
  console.log('   EMAIL_USER="your-email@gmail.com"')
  console.log('   EMAIL_PASS="your-16-digit-app-password"')
  console.log()
}

// 運行設置
async function runSetup() {
  const setup = new EmailServiceSetup()
  
  // 檢查是否需要顯示 Gmail 指南
  const args = process.argv.slice(2)
  if (args.includes('--gmail-guide')) {
    showGmailSetupGuide()
    return
  }
  
  await setup.runSetup()
  
  // 提供額外幫助
  console.log('💡 需要更多幫助?')
  console.log('   • Gmail 設定: tsx scripts/setup-email-service.ts --gmail-guide')
  console.log('   • 完整測試: tsx scripts/test-email-system.ts')
  console.log('   • 文檔: 查看 .env.example 文件中的詳細說明')
}

// 如果直接運行此腳本
if (require.main === module) {
  runSetup().catch(console.error)
}

export { EmailServiceSetup }