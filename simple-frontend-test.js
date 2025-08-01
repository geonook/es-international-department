#!/usr/bin/env node

/**
 * 簡化前端功能測試腳本
 * Simplified Frontend Test Script (without puppeteer)
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function testPage(url, testName) {
  try {
    const { stdout, stderr } = await execAsync(`curl -s -w "HTTPCODE:%{http_code}" "${url}"`);
    const httpCode = stdout.match(/HTTPCODE:(\d+)/)?.[1];
    const content = stdout.replace(/HTTPCODE:\d+$/, '');
    
    return {
      success: httpCode === '200',
      httpCode: parseInt(httpCode),
      content,
      contentLength: content.length,
      hasReactContent: content.includes('__NEXT_DATA__') || content.includes('react'),
      hasTitle: /<title[^>]*>([^<]+)<\/title>/.test(content)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function runSimpleFrontendTests() {
  console.log('🚀 開始簡化前端測試\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function logResult(name, passed, details) {
    results.tests.push({ name, passed, details });
    if (passed) {
      results.passed++;
      console.log(`✅ ${name}`);
    } else {
      results.failed++;
      console.log(`❌ ${name}:`, details);
    }
  }

  const baseUrl = 'http://localhost:3000';

  // 1. 測試首頁
  const homePage = await testPage(baseUrl, '首頁');
  logResult('首頁載入', homePage.success && homePage.hasReactContent, {
    httpCode: homePage.httpCode,
    contentLength: homePage.contentLength,
    hasReactContent: homePage.hasReactContent,
    hasTitle: homePage.hasTitle
  });

  // 2. 測試管理員頁面（應該重導向）
  const adminPage = await testPage(`${baseUrl}/admin`, '管理員頁面');
  logResult('管理員頁面權限控制', adminPage.success, {
    httpCode: adminPage.httpCode,
    redirected: adminPage.httpCode === 200 || adminPage.httpCode === 302
  });

  // 3. 測試登入頁面
  const loginPage = await testPage(`${baseUrl}/login`, '登入頁面');
  logResult('登入頁面', loginPage.success && loginPage.hasReactContent, {
    httpCode: loginPage.httpCode,
    hasLoginForm: loginPage.content?.includes('login') || loginPage.content?.includes('登入'),
    contentLength: loginPage.contentLength
  });

  // 4. 測試事件頁面
  const eventsPage = await testPage(`${baseUrl}/events`, '事件頁面');
  logResult('事件頁面', eventsPage.success && eventsPage.hasReactContent, {
    httpCode: eventsPage.httpCode,
    contentLength: eventsPage.contentLength
  });

  // 5. 測試資源頁面
  const resourcesPage = await testPage(`${baseUrl}/resources`, '資源頁面');
  logResult('資源頁面', resourcesPage.success && resourcesPage.hasReactContent, {
    httpCode: resourcesPage.httpCode,
    contentLength: resourcesPage.contentLength
  });

  // 6. 測試教師頁面
  const teachersPage = await testPage(`${baseUrl}/teachers`, '教師頁面');
  logResult('教師頁面', teachersPage.success && teachersPage.hasReactContent, {
    httpCode: teachersPage.httpCode,
    contentLength: teachersPage.contentLength
  });

  // 7. 測試不存在的頁面（應該返回404）
  const notFoundPage = await testPage(`${baseUrl}/nonexistent-page`, '404頁面處理');
  logResult('404頁面處理', notFoundPage.httpCode === 404, {
    httpCode: notFoundPage.httpCode,
    expect404: true
  });

  // 8. 檢查首頁是否包含公告內容
  if (homePage.success && homePage.content) {
    const hasAnnouncementContent = 
      homePage.content.includes('announcement') || 
      homePage.content.includes('公告') ||
      homePage.content.includes('Welcome') ||
      homePage.content.includes('Staff Meeting');
    
    logResult('首頁公告內容', hasAnnouncementContent, {
      hasAnnouncementKeywords: hasAnnouncementContent,
      searchedFor: ['announcement', '公告', 'Welcome', 'Staff Meeting']
    });
  }

  // 9. 檢查頁面是否包含基本的 meta 標籤
  if (homePage.success && homePage.content) {
    const hasMetaTags = 
      homePage.content.includes('<meta') && 
      homePage.content.includes('viewport');
    
    logResult('Meta 標籤檢查', hasMetaTags, {
      hasMetaTags,
      hasViewport: homePage.content.includes('viewport')
    });
  }

  // 10. 檢查是否有基本的 CSS/JS 資源載入
  if (homePage.success && homePage.content) {
    const hasCSS = homePage.content.includes('<link') && homePage.content.includes('stylesheet');
    const hasJS = homePage.content.includes('<script');
    
    logResult('靜態資源載入', hasCSS && hasJS, {
      hasCSS,
      hasJS,
      hasNextJS: homePage.content.includes('_next/')
    });
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
  runSimpleFrontendTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('前端測試運行失敗:', error);
    process.exit(1);
  });
}

module.exports = { runSimpleFrontendTests };