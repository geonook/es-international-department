#!/usr/bin/env node

/**
 * Comprehensive API Endpoint Verification Test
 * KCISLK ESID Info Hub - 完整的 API 端點驗證測試
 * 
 * This script performs thorough testing of all API endpoints including:
 * - Health checks
 * - Authentication system
 * - Announcements (public and admin)
 * - Events management
 * - Resources management  
 * - File upload system
 * - Notification system
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 10000, // 10 seconds
  retries: 3,
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Test results aggregator
class TestResults {
  constructor() {
    this.results = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      categories: {},
      errors: [],
      performance: {},
      startTime: new Date(),
      endTime: null
    };
  }

  addTest(category, testName, passed, details = {}, performance = {}) {
    this.results.totalTests++;
    
    if (!this.results.categories[category]) {
      this.results.categories[category] = {
        total: 0,
        passed: 0,
        failed: 0,
        tests: []
      };
    }

    const test = {
      name: testName,
      passed,
      details,
      performance,
      timestamp: new Date()
    };

    this.results.categories[category].tests.push(test);
    this.results.categories[category].total++;

    if (passed) {
      this.results.passed++;
      this.results.categories[category].passed++;
      console.log(`✅ [${category}] ${testName}`);
      if (CONFIG.logLevel === 'debug') {
        console.log(`   Details:`, details);
      }
    } else {
      this.results.failed++;
      this.results.categories[category].failed++;
      this.results.errors.push({ category, testName, details });
      console.log(`❌ [${category}] ${testName}`);
      console.log(`   Error:`, details);
    }

    if (performance.responseTime) {
      if (!this.results.performance[category]) {
        this.results.performance[category] = [];
      }
      this.results.performance[category].push({
        test: testName,
        responseTime: performance.responseTime
      });
    }
  }

  finalize() {
    this.results.endTime = new Date();
    this.results.duration = this.results.endTime - this.results.startTime;
    return this.results;
  }

  generateReport() {
    const results = this.finalize();
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 API 端點驗證測試完整報告');
    console.log('='.repeat(80));
    
    console.log(`\n📈 總體統計:`);
    console.log(`   總測試數: ${results.totalTests}`);
    console.log(`   通過: ${results.passed} (${((results.passed / results.totalTests) * 100).toFixed(2)}%)`);
    console.log(`   失敗: ${results.failed} (${((results.failed / results.totalTests) * 100).toFixed(2)}%)`);
    console.log(`   跳過: ${results.skipped}`);
    console.log(`   測試時間: ${(results.duration / 1000).toFixed(2)} 秒`);

    console.log(`\n📋 分類統計:`);
    Object.entries(results.categories).forEach(([category, stats]) => {
      const successRate = ((stats.passed / stats.total) * 100).toFixed(2);
      console.log(`   ${category}: ${stats.passed}/${stats.total} (${successRate}%)`);
    });

    if (results.errors.length > 0) {
      console.log(`\n❌ 失敗的測試詳情:`);
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. [${error.category}] ${error.testName}`);
        if (error.details.error) {
          console.log(`      錯誤: ${error.details.error}`);
        }
        if (error.details.expectedStatus && error.details.actualStatus) {
          console.log(`      預期狀態: ${error.details.expectedStatus}, 實際狀態: ${error.details.actualStatus}`);
        }
      });
    }

    console.log(`\n⚡ 效能統計:`);
    Object.entries(results.performance).forEach(([category, perf]) => {
      if (perf.length > 0) {
        const avgTime = perf.reduce((sum, p) => sum + p.responseTime, 0) / perf.length;
        const maxTime = Math.max(...perf.map(p => p.responseTime));
        const minTime = Math.min(...perf.map(p => p.responseTime));
        console.log(`   ${category}: 平均 ${avgTime.toFixed(0)}ms, 最大 ${maxTime}ms, 最小 ${minTime}ms`);
      }
    });

    // Save results to file
    const reportPath = path.join(__dirname, 'api-test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 詳細測試結果已保存至: ${reportPath}`);

    return results;
  }
}

// HTTP Request utility with retry logic
async function makeRequest(endpoint, options = {}) {
  const url = `${CONFIG.baseUrl}${endpoint}`;
  const startTime = Date.now();
  
  const requestOptions = {
    headers: { 
      'Content-Type': 'application/json',
      ...options.headers 
    },
    timeout: CONFIG.timeout,
    ...options
  };

  let lastError;
  
  for (let attempt = 1; attempt <= CONFIG.retries; attempt++) {
    try {
      const response = await fetch(url, requestOptions);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        data,
        responseTime,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      lastError = error;
      if (attempt < CONFIG.retries) {
        console.log(`⚠️  請求失敗，第 ${attempt} 次重試: ${endpoint}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  return {
    ok: false,
    status: 0,
    error: lastError.message,
    responseTime: Date.now() - startTime
  };
}

// Individual test categories
class HealthCheckTests {
  constructor(testResults) {
    this.testResults = testResults;
  }

  async runAll() {
    console.log('\n🏥 執行健康檢查測試...');
    
    await this.testBasicHealthCheck();
    await this.testHealthCheckHead();
    await this.testHealthCheckResponseFormat();
  }

  async testBasicHealthCheck() {
    const response = await makeRequest('/api/health');
    
    const passed = response.ok && 
                  response.status === 200 && 
                  response.data && 
                  response.data.status === 'OK';

    this.testResults.addTest(
      'Health Check',
      '基本健康檢查',
      passed,
      {
        status: response.status,
        responseData: response.data,
        hasRequiredFields: !!(response.data?.status && response.data?.service)
      },
      { responseTime: response.responseTime }
    );
  }

  async testHealthCheckHead() {
    const response = await makeRequest('/api/health', { method: 'HEAD' });
    
    const passed = response.status === 200;

    this.testResults.addTest(
      'Health Check',
      'HEAD 請求支援',
      passed,
      {
        status: response.status,
        method: 'HEAD'
      },
      { responseTime: response.responseTime }
    );
  }

  async testHealthCheckResponseFormat() {
    const response = await makeRequest('/api/health');
    
    if (response.ok && response.data) {
      const hasRequiredFields = !!(
        response.data.status &&
        response.data.service &&
        response.data.timestamp
      );

      this.testResults.addTest(
        'Health Check',
        '回應格式驗證',
        hasRequiredFields,
        {
          fields: {
            status: !!response.data.status,
            service: !!response.data.service,
            timestamp: !!response.data.timestamp,
            environment: !!response.data.environment
          }
        }
      );
    } else {
      this.testResults.addTest(
        'Health Check',
        '回應格式驗證',
        false,
        { error: '無法獲取健康檢查回應' }
      );
    }
  }
}

class AuthenticationTests {
  constructor(testResults) {
    this.testResults = testResults;
  }

  async runAll() {
    console.log('\n🔐 執行認證系統測試...');
    
    await this.testMeEndpointWithoutAuth();
    await this.testAuthTokenValidation();
    await this.testInvalidToken();
    await this.testMeEndpointMethodsValidation();
  }

  async testMeEndpointWithoutAuth() {
    const response = await makeRequest('/api/auth/me');
    
    const passed = response.status === 401 && 
                  response.data && 
                  response.data.success === false;

    this.testResults.addTest(
      'Authentication',
      '未認證訪問 /auth/me',
      passed,
      {
        expectedStatus: 401,
        actualStatus: response.status,
        hasErrorMessage: !!(response.data?.message || response.data?.error)
      },
      { responseTime: response.responseTime }
    );
  }

  async testAuthTokenValidation() {
    const response = await makeRequest('/api/auth/me', {
      headers: {
        'Authorization': 'Bearer invalid-token-format'
      }
    });
    
    const passed = response.status === 401;

    this.testResults.addTest(
      'Authentication',
      'JWT Token 格式驗證',
      passed,
      {
        expectedStatus: 401,
        actualStatus: response.status,
        tokenProvided: true
      },
      { responseTime: response.responseTime }
    );
  }

  async testInvalidToken() {
    const response = await makeRequest('/api/auth/me', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid'
      }
    });
    
    const passed = response.status === 401;

    this.testResults.addTest(
      'Authentication',
      '無效 JWT Token 處理',
      passed,
      {
        expectedStatus: 401,
        actualStatus: response.status
      },
      { responseTime: response.responseTime }
    );
  }

  async testMeEndpointMethodsValidation() {
    const methods = ['POST', 'DELETE'];
    
    for (const method of methods) {
      const response = await makeRequest('/api/auth/me', { method });
      
      const passed = response.status === 405;

      this.testResults.addTest(
        'Authentication',
        `不支援的 HTTP 方法: ${method}`,
        passed,
        {
          method,
          expectedStatus: 405,
          actualStatus: response.status
        }
      );
    }
  }
}

class AnnouncementsTests {
  constructor(testResults) {
    this.testResults = testResults;
  }

  async runAll() {
    console.log('\n📢 執行公告系統測試...');
    
    await this.testGetAnnouncements();
    await this.testAnnouncementsPagination();
    await this.testAnnouncementsFiltering();
    await this.testAnnouncementsSearch();
    await this.testCreateAnnouncementWithoutAuth();
    await this.testAnnouncementsSorting();
    await this.testInvalidAnnouncementId();
  }

  async testGetAnnouncements() {
    const response = await makeRequest('/api/announcements');
    
    const passed = response.ok && 
                  response.data && 
                  response.data.success === true &&
                  Array.isArray(response.data.data);

    this.testResults.addTest(
      'Announcements',
      '取得公告列表',
      passed,
      {
        status: response.status,
        hasData: Array.isArray(response.data?.data),
        count: response.data?.data?.length,
        hasPagination: !!(response.data?.pagination)
      },
      { responseTime: response.responseTime }
    );

    return response.data?.data || [];
  }

  async testAnnouncementsPagination() {
    const page1 = await makeRequest('/api/announcements?page=1&limit=2');
    const page2 = await makeRequest('/api/announcements?page=2&limit=2');
    
    const passed = page1.ok && page2.ok &&
                  page1.data?.pagination &&
                  page2.data?.pagination;

    this.testResults.addTest(
      'Announcements',
      '分頁功能測試',
      passed,
      {
        page1Status: page1.status,
        page2Status: page2.status,
        page1Count: page1.data?.data?.length,
        page2Count: page2.data?.data?.length,
        page1Pagination: page1.data?.pagination,
        page2Pagination: page2.data?.pagination
      }
    );
  }

  async testAnnouncementsFiltering() {
    const filters = [
      { name: '目標對象篩選 - teachers', filter: 'targetAudience=teachers' },
      { name: '目標對象篩選 - parents', filter: 'targetAudience=parents' },
      { name: '優先級篩選 - high', filter: 'priority=high' },
      { name: '狀態篩選 - published', filter: 'status=published' }
    ];

    for (const test of filters) {
      const response = await makeRequest(`/api/announcements?${test.filter}`);
      
      const passed = response.ok && response.data?.success === true;

      this.testResults.addTest(
        'Announcements',
        test.name,
        passed,
        {
          filter: test.filter,
          status: response.status,
          count: response.data?.data?.length
        }
      );
    }
  }

  async testAnnouncementsSearch() {
    const response = await makeRequest('/api/announcements?search=test');
    
    const passed = response.ok && response.data?.success === true;

    this.testResults.addTest(
      'Announcements',
      '搜尋功能測試',
      passed,
      {
        searchTerm: 'test',
        status: response.status,
        count: response.data?.data?.length
      },
      { responseTime: response.responseTime }
    );
  }

  async testCreateAnnouncementWithoutAuth() {
    const response = await makeRequest('/api/announcements', {
      method: 'POST',
      body: JSON.stringify({
        title: '測試公告',
        content: '測試內容',
        targetAudience: 'all'
      })
    });
    
    const passed = response.status === 401;

    this.testResults.addTest(
      'Announcements',
      '未認證建立公告權限控制',
      passed,
      {
        expectedStatus: 401,
        actualStatus: response.status
      }
    );
  }

  async testAnnouncementsSorting() {
    const response = await makeRequest('/api/announcements?limit=5');
    
    if (response.ok && response.data?.data?.length > 1) {
      const announcements = response.data.data;
      let correctSort = true;
      
      // Check if announcements are sorted by priority (desc) then by publishedAt (desc)
      for (let i = 0; i < announcements.length - 1; i++) {
        const current = announcements[i];
        const next = announcements[i + 1];
        
        // Priority comparison (high > medium > low)
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const currentPriority = priorityOrder[current.priority] || 0;
        const nextPriority = priorityOrder[next.priority] || 0;
        
        if (currentPriority < nextPriority) {
          correctSort = false;
          break;
        }
      }

      this.testResults.addTest(
        'Announcements',
        '排序邏輯驗證',
        correctSort,
        {
          itemCount: announcements.length,
          firstItemPriority: announcements[0]?.priority,
          sortingCorrect: correctSort
        }
      );
    } else {
      this.testResults.addTest(
        'Announcements',
        '排序邏輯驗證',
        false,
        { error: '無足夠資料進行排序測試' }
      );
    }
  }

  async testInvalidAnnouncementId() {
    const response = await makeRequest('/api/announcements/invalid-id');
    
    const passed = response.status === 400 || response.status === 404;

    this.testResults.addTest(
      'Announcements',
      '無效公告 ID 處理',
      passed,
      {
        expectedStatus: '400 or 404',
        actualStatus: response.status
      }
    );
  }
}

class EventsTests {
  constructor(testResults) {
    this.testResults = testResults;
  }

  async runAll() {
    console.log('\n📅 執行活動管理測試...');
    
    await this.testGetEvents();
    await this.testEventsCalendar();
    await this.testEventRegistration();
    await this.testAdminEventsAccess();
    await this.testEventNotifications();
  }

  async testGetEvents() {
    const response = await makeRequest('/api/events');
    
    const passed = response.ok && 
                  (response.data?.success === true || Array.isArray(response.data));

    this.testResults.addTest(
      'Events',
      '取得活動列表',
      passed,
      {
        status: response.status,
        hasData: !!(response.data?.data || response.data)
      },
      { responseTime: response.responseTime }
    );
  }

  async testEventsCalendar() {
    const response = await makeRequest('/api/events/calendar');
    
    const passed = response.ok;

    this.testResults.addTest(
      'Events',
      '活動日曆資料端點',
      passed,
      {
        status: response.status,
        hasCalendarData: !!(response.data)
      },
      { responseTime: response.responseTime }
    );
  }

  async testEventRegistration() {
    // Test registration endpoint access (should require auth)
    const response = await makeRequest('/api/events/1/registration', {
      method: 'POST',
      body: JSON.stringify({ userId: 1 })
    });
    
    const passed = response.status === 401 || response.status === 404;

    this.testResults.addTest(
      'Events',
      '活動報名端點權限控制',
      passed,
      {
        expectedStatus: '401 or 404',
        actualStatus: response.status
      }
    );
  }

  async testAdminEventsAccess() {
    const response = await makeRequest('/api/admin/events');
    
    const passed = response.status === 401 || response.status === 403;

    this.testResults.addTest(
      'Events',
      '管理員活動端點權限控制',
      passed,
      {
        expectedStatus: '401 or 403',
        actualStatus: response.status
      }
    );
  }

  async testEventNotifications() {
    const response = await makeRequest('/api/events/1/notifications');
    
    const passed = response.status === 401 || response.status === 404 || response.ok;

    this.testResults.addTest(
      'Events',
      '活動通知端點',
      passed,
      {
        status: response.status
      }
    );
  }
}

class ResourcesTests {
  constructor(testResults) {
    this.testResults = testResults;
  }

  async runAll() {
    console.log('\n📚 執行資源管理測試...');
    
    await this.testAdminResourcesAccess();
    await this.testResourceCategories();
    await this.testResourceAnalytics();
    await this.testResourceBulkOperations();
    await this.testResourceGradeLevels();
  }

  async testAdminResourcesAccess() {
    const response = await makeRequest('/api/admin/resources');
    
    const passed = response.status === 401 || response.status === 403;

    this.testResults.addTest(
      'Resources',
      '管理員資源端點權限控制',
      passed,
      {
        expectedStatus: '401 or 403',
        actualStatus: response.status
      }
    );
  }

  async testResourceCategories() {
    const response = await makeRequest('/api/admin/resources/categories');
    
    const passed = response.status === 401 || response.status === 403;

    this.testResults.addTest(
      'Resources',
      '資源分類管理端點',
      passed,
      {
        expectedStatus: '401 or 403',
        actualStatus: response.status
      }
    );
  }

  async testResourceAnalytics() {
    const response = await makeRequest('/api/admin/resources/analytics');
    
    const passed = response.status === 401 || response.status === 403;

    this.testResults.addTest(
      'Resources',
      '資源分析端點',
      passed,
      {
        expectedStatus: '401 or 403',
        actualStatus: response.status
      }
    );
  }

  async testResourceBulkOperations() {
    const response = await makeRequest('/api/admin/resources/bulk', {
      method: 'POST',
      body: JSON.stringify({ action: 'test' })
    });
    
    const passed = response.status === 401 || response.status === 403;

    this.testResults.addTest(
      'Resources',
      '資源批量操作端點',
      passed,
      {
        expectedStatus: '401 or 403',
        actualStatus: response.status
      }
    );
  }

  async testResourceGradeLevels() {
    const response = await makeRequest('/api/admin/resources/grade-levels');
    
    const passed = response.status === 401 || response.status === 403;

    this.testResults.addTest(
      'Resources',
      '年級層級端點',
      passed,
      {
        expectedStatus: '401 or 403',
        actualStatus: response.status
      }
    );
  }
}

class FileUploadTests {
  constructor(testResults) {
    this.testResults = testResults;
  }

  async runAll() {
    console.log('\n📁 執行檔案上傳測試...');
    
    await this.testUploadEndpointAccess();
    await this.testImageUploadEndpoint();
    await this.testFileAccessEndpoint();
    await this.testUploadWithoutAuth();
  }

  async testUploadEndpointAccess() {
    const response = await makeRequest('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    const passed = response.status === 401 || response.status === 400;

    this.testResults.addTest(
      'File Upload',
      '檔案上傳端點存在性',
      passed,
      {
        status: response.status,
        note: 'Expected 401 (auth required) or 400 (bad request format)'
      }
    );
  }

  async testImageUploadEndpoint() {
    const response = await makeRequest('/api/upload/images', {
      method: 'POST'
    });
    
    const passed = response.status === 401 || response.status === 400;

    this.testResults.addTest(
      'File Upload',
      '圖片上傳端點',
      passed,
      {
        status: response.status
      }
    );
  }

  async testFileAccessEndpoint() {
    const response = await makeRequest('/api/files/test.txt');
    
    const passed = response.status === 404 || response.ok;

    this.testResults.addTest(
      'File Upload',
      '檔案存取端點',
      passed,
      {
        status: response.status
      }
    );
  }

  async testUploadWithoutAuth() {
    const response = await makeRequest('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ fileName: 'test.txt', content: 'test' })
    });
    
    const passed = response.status === 401;

    this.testResults.addTest(
      'File Upload',
      '未認證上傳權限控制',
      passed,
      {
        expectedStatus: 401,
        actualStatus: response.status
      }
    );
  }
}

class NotificationTests {
  constructor(testResults) {
    this.testResults = testResults;
  }

  async runAll() {
    console.log('\n🔔 執行通知系統測試...');
    
    await this.testNotificationsEndpoint();
    await this.testNotificationPreferences();
    await this.testNotificationStats();
    await this.testNotificationStream();
    await this.testNotificationTemplates();
    await this.testMarkAsRead();
  }

  async testNotificationsEndpoint() {
    const response = await makeRequest('/api/notifications');
    
    const passed = response.status === 401 || response.ok;

    this.testResults.addTest(
      'Notifications',
      '通知列表端點',
      passed,
      {
        status: response.status
      },
      { responseTime: response.responseTime }
    );
  }

  async testNotificationPreferences() {
    const response = await makeRequest('/api/notifications/preferences');
    
    const passed = response.status === 401 || response.ok;

    this.testResults.addTest(
      'Notifications',
      '通知偏好設定端點',
      passed,
      {
        status: response.status
      }
    );
  }

  async testNotificationStats() {
    const response = await makeRequest('/api/notifications/stats');
    
    const passed = response.status === 401 || response.ok;

    this.testResults.addTest(
      'Notifications',
      '通知統計端點',
      passed,
      {
        status: response.status
      }
    );
  }

  async testNotificationStream() {
    const response = await makeRequest('/api/notifications/stream');
    
    const passed = response.status === 401 || response.ok;

    this.testResults.addTest(
      'Notifications',
      '即時通知串流端點',
      passed,
      {
        status: response.status
      }
    );
  }

  async testNotificationTemplates() {
    const response = await makeRequest('/api/notifications/templates');
    
    const passed = response.status === 401 || response.ok;

    this.testResults.addTest(
      'Notifications',
      '通知模板端點',
      passed,
      {
        status: response.status
      }
    );
  }

  async testMarkAsRead() {
    const response = await makeRequest('/api/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ notificationIds: [1] })
    });
    
    const passed = response.status === 401 || response.ok;

    this.testResults.addTest(
      'Notifications',
      '標記已讀端點',
      passed,
      {
        status: response.status
      }
    );
  }
}

// Main test runner
async function runComprehensiveApiTests() {
  console.log('🚀 開始執行完整的 API 端點驗證測試');
  console.log(`📍 測試目標: ${CONFIG.baseUrl}`);
  console.log(`⏱️  超時設定: ${CONFIG.timeout}ms`);
  console.log(`🔄 重試次數: ${CONFIG.retries}`);
  console.log('='.repeat(80));

  const testResults = new TestResults();

  try {
    // Run all test categories
    const healthTests = new HealthCheckTests(testResults);
    await healthTests.runAll();

    const authTests = new AuthenticationTests(testResults);
    await authTests.runAll();

    const announcementTests = new AnnouncementsTests(testResults);
    await announcementTests.runAll();

    const eventTests = new EventsTests(testResults);
    await eventTests.runAll();

    const resourceTests = new ResourcesTests(testResults);
    await resourceTests.runAll();

    const uploadTests = new FileUploadTests(testResults);
    await uploadTests.runAll();

    const notificationTests = new NotificationTests(testResults);
    await notificationTests.runAll();

    // Generate final report
    const results = testResults.generateReport();

    // Recommendations based on results
    console.log('\n💡 改進建議:');
    
    if (results.failed === 0) {
      console.log('   🎉 所有測試都通過了！API 端點運作正常。');
    } else {
      console.log('   📋 建議優先處理以下問題:');
      
      const criticalErrors = results.errors.filter(e => 
        e.details.actualStatus >= 500 || 
        e.testName.includes('健康檢查') ||
        e.testName.includes('認證')
      );

      if (criticalErrors.length > 0) {
        console.log('   🚨 關鍵問題 (需要立即修復):');
        criticalErrors.forEach(error => {
          console.log(`      - ${error.testName}: ${error.details.error || '服務器錯誤'}`);
        });
      }

      const authIssues = results.errors.filter(e => e.category === 'Authentication');
      if (authIssues.length > 0) {
        console.log('   🔐 認證系統問題:');
        console.log('      - 檢查 JWT token 配置');
        console.log('      - 驗證認證中間件設置');
      }

      const permissionIssues = results.errors.filter(e => 
        e.details.actualStatus === 403 || e.testName.includes('權限')
      );
      if (permissionIssues.length > 0) {
        console.log('   🛡️  權限控制問題:');
        console.log('      - 檢查角色權限配置');
        console.log('      - 驗證 RBAC 系統設置');
      }
    }

    // Performance recommendations
    const avgResponseTimes = Object.entries(results.performance).map(([category, perf]) => ({
      category,
      avgTime: perf.reduce((sum, p) => sum + p.responseTime, 0) / perf.length
    }));

    const slowCategories = avgResponseTimes.filter(cat => cat.avgTime > 1000);
    if (slowCategories.length > 0) {
      console.log('   ⚡ 效能優化建議:');
      slowCategories.forEach(cat => {
        console.log(`      - ${cat.category}: 平均回應時間 ${cat.avgTime.toFixed(0)}ms (建議 < 1000ms)`);
      });
    }

    console.log('\n📊 API 健康度評估:');
    const healthScore = (results.passed / results.totalTests) * 100;
    let healthLevel = '🔴 需要改進';
    if (healthScore >= 95) healthLevel = '🟢 優秀';
    else if (healthScore >= 85) healthLevel = '🟡 良好';
    else if (healthScore >= 70) healthLevel = '🟠 一般';

    console.log(`   總分: ${healthScore.toFixed(1)}% ${healthLevel}`);

    return results;

  } catch (error) {
    console.error('❌ 測試執行過程中發生錯誤:', error);
    return testResults.finalize();
  }
}

// Execute tests if run directly
if (require.main === module) {
  runComprehensiveApiTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('測試執行失敗:', error);
      process.exit(1);
    });
}

module.exports = { 
  runComprehensiveApiTests, 
  HealthCheckTests,
  AuthenticationTests,
  AnnouncementsTests,
  EventsTests,
  ResourcesTests,
  FileUploadTests,
  NotificationTests
};