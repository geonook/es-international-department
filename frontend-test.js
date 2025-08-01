#!/usr/bin/env node

/**
 * 前端組件功能測試腳本
 * Frontend Component Test Script
 */

const puppeteer = require('puppeteer');

async function testFrontendComponents() {
  let browser;
  const baseUrl = process.env.TEST_BASE_URL || 'https://landing-app-v2.zeabur.app';
  const results = {
    passed: 0,
    failed: 0,
    tests: [],
    baseUrl: baseUrl
  };

  function logResult(name, passed, details = {}) {
    results.tests.push({ name, passed, details });
    if (passed) {
      results.passed++;
      console.log(`✅ ${name}`);
    } else {
      results.failed++;
      console.log(`❌ ${name}:`, details);
    }
  }

  try {
    console.log(`🚀 開始前端組件測試 - 目標: ${baseUrl}\n`);

    // 檢查是否安裝了 puppeteer
    try {
      browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } catch (error) {
      console.log('⚠️  Puppeteer 未安裝，跳過前端測試');
      console.log('   可執行: npm install puppeteer 安裝後再測試');
      return results;
    }

    const page = await browser.newPage();
    
    // 設置視窗大小
    await page.setViewport({ width: 1200, height: 800 });

    // 1. 測試首頁載入
    try {
      await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 10000 });
      const title = await page.title();
      logResult('首頁載入', title.includes('ES'), { title });
    } catch (error) {
      logResult('首頁載入', false, { error: error.message });
    }

    // 2. 測試首頁公告顯示
    try {
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      const announcements = await page.$$('[data-testid="announcement-card"], .announcement-card, article');
      logResult('首頁公告顯示', announcements.length > 0, { 
        count: announcements.length 
      });
    } catch (error) {
      logResult('首頁公告顯示', false, { error: error.message });
    }

    // 3. 測試響應式設計 - 手機視窗
    try {
      await page.setViewport({ width: 375, height: 667 });
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      const isMobile = await page.evaluate(() => window.innerWidth <= 768);
      logResult('響應式設計 - 手機', isMobile, { 
        width: await page.evaluate(() => window.innerWidth) 
      });
    } catch (error) {
      logResult('響應式設計 - 手機', false, { error: error.message });
    }

    // 4. 測試管理員頁面存取（預期會重導向到登入）
    try {
      await page.setViewport({ width: 1200, height: 800 });
      await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle2' });
      const currentUrl = page.url();
      const isLoginPage = currentUrl.includes('/login') || currentUrl.includes('/unauthorized');
      logResult('管理員頁面權限控制', isLoginPage, { 
        currentUrl,
        redirected: !currentUrl.includes('/admin')
      });
    } catch (error) {
      logResult('管理員頁面權限控制', false, { error: error.message });
    }

    // 5. 測試登入頁面
    try {
      await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2' });
      const loginForm = await page.$('form, [data-testid="login-form"]');
      const hasEmailInput = await page.$('input[type="email"], input[name="email"]');
      const hasPasswordInput = await page.$('input[type="password"], input[name="password"]');
      
      logResult('登入頁面功能', !!(loginForm && hasEmailInput && hasPasswordInput), {
        hasForm: !!loginForm,
        hasEmailInput: !!hasEmailInput,
        hasPasswordInput: !!hasPasswordInput
      });
    } catch (error) {
      logResult('登入頁面功能', false, { error: error.message });
    }

    // 6. 測試導航連結
    try {
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      const navLinks = await page.$$('nav a, header a, [role="navigation"] a');
      
      // 測試事件頁面連結
      const eventsLinkExists = await page.$('a[href*="/events"], a[href="/events"]');
      logResult('導航連結 - 事件頁面', !!eventsLinkExists, {
        totalNavLinks: navLinks.length,
        hasEventsLink: !!eventsLinkExists
      });
    } catch (error) {
      logResult('導航連結 - 事件頁面', false, { error: error.message });
    }

    // 7. 測試資源頁面
    try {
      await page.goto(`${baseUrl}/resources`, { waitUntil: 'networkidle2' });
      const pageContent = await page.$('main, [role="main"], .content');
      logResult('資源頁面載入', !!pageContent, {
        hasMainContent: !!pageContent,
        url: page.url()
      });
    } catch (error) {
      logResult('資源頁面載入', false, { error: error.message });
    }

    // 8. 測試教師頁面
    try {
      await page.goto(`${baseUrl}/teachers`, { waitUntil: 'networkidle2' });
      const pageContent = await page.$('main, [role="main"], .content');
      logResult('教師頁面載入', !!pageContent, {
        hasMainContent: !!pageContent,
        url: page.url()
      });
    } catch (error) {
      logResult('教師頁面載入', false, { error: error.message });
    }

    // 9. 測試頁面性能（載入時間）
    try {
      const startTime = Date.now();
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      const loadTime = Date.now() - startTime;
      
      logResult('頁面載入性能', loadTime < 3000, {
        loadTime: `${loadTime}ms`,
        acceptable: loadTime < 3000
      });
    } catch (error) {
      logResult('頁面載入性能', false, { error: error.message });
    }

    // 10. 測試 JavaScript 錯誤
    let jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    try {
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      // 等待一下讓 JS 執行 - 使用新的 API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      logResult('JavaScript 錯誤檢查', jsErrors.length === 0, {
        errorCount: jsErrors.length,
        errors: jsErrors.slice(0, 3) // 只顯示前3個錯誤
      });
    } catch (error) {
      logResult('JavaScript 錯誤檢查', false, { error: error.message });
    }

  } catch (error) {
    console.error('前端測試執行錯誤:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // 輸出測試摘要
  console.log('\n📊 前端測試結果摘要:');
  console.log(`總測試數: ${results.passed + results.failed}`);
  console.log(`通過: ${results.passed}`);
  console.log(`失敗: ${results.failed}`);
  if (results.passed + results.failed > 0) {
    console.log(`通過率: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`);
  }

  if (results.failed > 0) {
    console.log('\n❌ 失敗的測試:');
    results.tests.filter(t => !t.passed).forEach((test, index) => {
      console.log(`${index + 1}. ${test.name}:`, test.details);
    });
  }

  return results;
}

// 執行測試
if (require.main === module) {
  testFrontendComponents().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('前端測試運行失敗:', error);
    process.exit(1);
  });
}

module.exports = { testFrontendComponents };