/**
 * Production OAuth Flow Testing Tool
 * 生產環境 OAuth 流程測試工具
 */

import puppeteer from 'puppeteer'
import dotenv from 'dotenv'

// 載入生產環境配置
dotenv.config({ path: '.env.production' })

interface TestResult {
  step: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  message: string
  details?: string
  timing?: number
}

class ProductionOAuthTester {
  private browser: any
  private page: any
  private results: TestResult[] = []
  private readonly PRODUCTION_URL = 'https://kcislk-infohub.zeabur.app'

  private addResult(step: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: string, timing?: number) {
    this.results.push({ step, status, message, details, timing })
  }

  /**
   * 初始化瀏覽器
   */
  async initBrowser() {
    console.log('🚀 Initializing browser for OAuth testing...')
    
    try {
      this.browser = await puppeteer.launch({
        headless: false, // 顯示瀏覽器以便觀察
        defaultViewport: null,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--allow-running-insecure-content'
        ]
      })
      
      this.page = await this.browser.newPage()
      
      // 設定用戶代理
      await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      
      // 監聽控制台訊息
      this.page.on('console', (msg: any) => {
        console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`)
      })
      
      // 監聽網路錯誤
      this.page.on('requestfailed', (request: any) => {
        console.error(`[Network Error] ${request.url()}: ${request.failure()?.errorText}`)
      })
      
      this.addResult('Browser Setup', 'PASS', 'Browser initialized successfully')
    } catch (error) {
      this.addResult('Browser Setup', 'FAIL', 'Failed to initialize browser', error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  /**
   * 測試登入頁面載入
   */
  async testLoginPageLoad() {
    console.log('📄 Testing login page load...')
    
    const startTime = Date.now()
    
    try {
      const response = await this.page.goto(`${this.PRODUCTION_URL}/login`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      })
      
      const loadTime = Date.now() - startTime
      
      if (response.status() === 200) {
        this.addResult('Login Page Load', 'PASS', 'Login page loaded successfully', `Status: ${response.status()}`, loadTime)
      } else {
        this.addResult('Login Page Load', 'FAIL', `Unexpected status code: ${response.status()}`, undefined, loadTime)
      }
      
      // 檢查是否有錯誤參數
      const currentUrl = this.page.url()
      if (currentUrl.includes('error=')) {
        const urlParams = new URLSearchParams(currentUrl.split('?')[1])
        const error = urlParams.get('error')
        const detail = urlParams.get('detail')
        this.addResult('URL Error Check', 'WARNING', `Error parameter detected: ${error}`, detail ? `Detail: ${decodeURIComponent(detail)}` : undefined)
      } else {
        this.addResult('URL Error Check', 'PASS', 'No error parameters in URL')
      }
      
    } catch (error) {
      this.addResult('Login Page Load', 'FAIL', 'Failed to load login page', error instanceof Error ? error.message : String(error))
    }
  }

  /**
   * 測試 Google 登入按鈕
   */
  async testGoogleLoginButton() {
    console.log('🔍 Testing Google login button...')
    
    try {
      // 等待 Google 登入按鈕出現
      await this.page.waitForSelector('button:contains("Log in with Google")', { timeout: 10000 })
      
      // 檢查按鈕是否可見且可點擊
      const buttonVisible = await this.page.isVisible('button:contains("Log in with Google")')
      const buttonEnabled = await this.page.isEnabled('button:contains("Log in with Google")')
      
      if (buttonVisible && buttonEnabled) {
        this.addResult('Google Login Button', 'PASS', 'Google login button is visible and enabled')
      } else {
        this.addResult('Google Login Button', 'FAIL', `Button state: visible=${buttonVisible}, enabled=${buttonEnabled}`)
      }
      
    } catch (error) {
      this.addResult('Google Login Button', 'FAIL', 'Google login button not found or not accessible', error instanceof Error ? error.message : String(error))
    }
  }

  /**
   * 測試 OAuth 初始化端點
   */
  async testOAuthInitialization() {
    console.log('🔄 Testing OAuth initialization endpoint...')
    
    const startTime = Date.now()
    
    try {
      // 嘗試訪問 OAuth 初始化端點
      const response = await this.page.goto(`${this.PRODUCTION_URL}/api/auth/google`, {
        waitUntil: 'networkidle2',
        timeout: 15000
      })
      
      const loadTime = Date.now() - startTime
      const currentUrl = this.page.url()
      
      if (currentUrl.includes('accounts.google.com')) {
        this.addResult('OAuth Initialization', 'PASS', 'Successfully redirected to Google OAuth', `Final URL: ${currentUrl.substring(0, 50)}...`, loadTime)
      } else if (currentUrl.includes('error=')) {
        const urlParams = new URLSearchParams(currentUrl.split('?')[1])
        const error = urlParams.get('error')
        const detail = urlParams.get('detail')
        this.addResult('OAuth Initialization', 'FAIL', `OAuth error: ${error}`, detail ? `Detail: ${decodeURIComponent(detail)}` : undefined, loadTime)
      } else {
        this.addResult('OAuth Initialization', 'WARNING', 'Unexpected redirect', `Current URL: ${currentUrl}`, loadTime)
      }
      
    } catch (error) {
      this.addResult('OAuth Initialization', 'FAIL', 'OAuth initialization failed', error instanceof Error ? error.message : String(error))
    }
  }

  /**
   * 測試環境變數和配置
   */
  async testEnvironmentConfiguration() {
    console.log('⚙️ Testing environment configuration...')
    
    const requiredVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'NEXTAUTH_URL',
      'JWT_SECRET',
      'NEXTAUTH_SECRET'
    ]
    
    let allConfigValid = true
    
    for (const varName of requiredVars) {
      const value = process.env[varName]
      if (!value) {
        this.addResult('Environment Config', 'FAIL', `Missing environment variable: ${varName}`)
        allConfigValid = false
      } else {
        this.addResult('Environment Config', 'PASS', `✓ ${varName} is configured`, `Length: ${value.length} characters`)
      }
    }
    
    // 驗證 NEXTAUTH_URL
    const nextAuthUrl = process.env.NEXTAUTH_URL
    if (nextAuthUrl === this.PRODUCTION_URL) {
      this.addResult('NEXTAUTH_URL', 'PASS', 'NEXTAUTH_URL matches production domain')
    } else {
      this.addResult('NEXTAUTH_URL', 'WARNING', `NEXTAUTH_URL mismatch`, `Expected: ${this.PRODUCTION_URL}, Got: ${nextAuthUrl}`)
    }
    
    return allConfigValid
  }

  /**
   * 執行完整測試套件
   */
  async runFullTest() {
    console.log('🧪 Starting Production OAuth Flow Testing...\n')
    
    try {
      await this.initBrowser()
      
      // 環境配置測試
      await this.testEnvironmentConfiguration()
      
      // 登入頁面測試
      await this.testLoginPageLoad()
      await this.testGoogleLoginButton()
      
      // OAuth 流程測試
      await this.testOAuthInitialization()
      
      // 等待用戶觀察結果
      console.log('\n⏳ Waiting 10 seconds for observation...')
      await new Promise(resolve => setTimeout(resolve, 10000))
      
    } finally {
      if (this.browser) {
        await this.browser.close()
      }
    }
    
    this.printResults()
    return this.getSummary()
  }

  /**
   * 打印測試結果
   */
  private printResults() {
    console.log('\n📊 Test Results')
    console.log('=' .repeat(80))
    
    for (const result of this.results) {
      const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
      const timing = result.timing ? ` (${result.timing}ms)` : ''
      
      console.log(`${statusIcon} [${result.step}] ${result.message}${timing}`)
      
      if (result.details) {
        console.log(`   Details: ${result.details}`)
      }
    }
  }

  /**
   * 取得測試總結
   */
  private getSummary() {
    const passes = this.results.filter(r => r.status === 'PASS').length
    const warnings = this.results.filter(r => r.status === 'WARNING').length
    const failures = this.results.filter(r => r.status === 'FAIL').length
    const total = this.results.length
    
    console.log('\n📋 Test Summary')
    console.log('=' .repeat(50))
    console.log(`✅ PASSED: ${passes}/${total}`)
    console.log(`⚠️ WARNINGS: ${warnings}/${total}`)
    console.log(`❌ FAILURES: ${failures}/${total}`)
    
    if (failures === 0) {
      console.log('\n🎉 All tests passed! OAuth configuration appears to be working.')
      return true
    } else {
      console.log('\n🚨 Some tests failed. Please check the results above.')
      return false
    }
  }
}

// 執行測試
async function main() {
  const tester = new ProductionOAuthTester()
  
  try {
    const success = await tester.runFullTest()
    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error('❌ Test execution failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { ProductionOAuthTester }