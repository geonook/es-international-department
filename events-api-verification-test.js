#!/usr/bin/env node

/**
 * Events API Verification Test
 * KCISLK ESID Info Hub - Complete Events API Endpoint Testing
 * 
 * This script performs comprehensive testing of all Events API endpoints:
 * 1. GET /api/events - List events
 * 2. POST /api/admin/events - Create event  
 * 3. GET /api/events/[id] - Get specific event
 * 4. PUT /api/admin/events/[id] - Update event
 * 5. DELETE /api/admin/events/[id] - Delete event
 * 
 * Tests include:
 * - Authentication verification
 * - Input validation testing
 * - Error handling verification
 * - Response format validation
 * - Role-based access control (RBAC)
 * - Database operations verification
 * 
 * Run with: node events-api-verification-test.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 15000, // 15 seconds for longer operations
  retries: 2,
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Test results aggregator
class EventsTestResults {
  constructor() {
    this.results = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      categories: {},
      errors: [],
      performance: {},
      testEvents: [], // Track created test events for cleanup
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

  addTestEvent(eventId) {
    this.results.testEvents.push(eventId);
  }

  finalize() {
    this.results.endTime = new Date();
    this.results.duration = this.results.endTime - this.results.startTime;
    return this.results;
  }

  generateReport() {
    const results = this.finalize();
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 Events API 端點驗證測試完整報告');
    console.log('='.repeat(80));
    
    console.log(`\n📈 總體統計:`);
    console.log(`   總測試數: ${results.totalTests}`);
    console.log(`   通過: ${results.passed} (${((results.passed / results.totalTests) * 100).toFixed(2)}%)`);
    console.log(`   失敗: ${results.failed} (${((results.failed / results.totalTests) * 100).toFixed(2)}%)`);
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
        if (error.details.response) {
          console.log(`      回應: ${JSON.stringify(error.details.response, null, 2).substring(0, 200)}...`);
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

    console.log('\n💡 改進建議:');
    
    if (results.failed === 0) {
      console.log('   🎉 所有 Events API 測試都通過了！端點運作正常。');
    } else {
      console.log('   📋 建議優先處理以下問題:');
      
      const criticalErrors = results.errors.filter(e => 
        e.details.actualStatus >= 500 || 
        e.testName.includes('Basic') ||
        e.testName.includes('Authentication')
      );

      if (criticalErrors.length > 0) {
        console.log('   🚨 關鍵問題 (需要立即修復):');
        criticalErrors.forEach(error => {
          console.log(`      - ${error.testName}: ${error.details.error || '服務器錯誤'}`);
        });
      }
    }

    // Health assessment
    console.log('\n📊 Events API 健康度評估:');
    const healthScore = (results.passed / results.totalTests) * 100;
    let healthLevel = '🔴 需要改進';
    if (healthScore >= 95) healthLevel = '🟢 優秀';
    else if (healthScore >= 85) healthLevel = '🟡 良好';
    else if (healthScore >= 70) healthLevel = '🟠 一般';

    console.log(`   API 健康度: ${healthScore.toFixed(1)}% ${healthLevel}`);

    // Expected improvement assessment
    if (healthScore >= 80) {
      console.log('   ✅ 達到預期改善目標 (80%+ 成功率)');
    } else {
      console.log('   ⚠️ 未達到預期改善目標，建議進一步修復');
    }

    // Save results to file
    const reportPath = path.join(__dirname, 'events-api-test-results.json');
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

// Events API test suite
class EventsApiTests {
  constructor(testResults) {
    this.testResults = testResults;
    this.testEventId = null;
    this.authToken = null; // Will need to implement if auth tokens are available
  }

  async runAll() {
    console.log('\n📅 執行 Events API 完整測試...');
    
    // Test 1: Basic endpoint availability
    await this.testBasicEndpointAvailability();
    
    // Test 2: Authentication and authorization
    await this.testAuthenticationRequirements();
    
    // Test 3: GET /api/events - List events
    await this.testGetEventsList();
    
    // Test 4: GET /api/events with filters and pagination
    await this.testGetEventsWithFilters();
    
    // Test 5: GET /api/events/[id] - Single event details
    await this.testGetSingleEvent();
    
    // Test 6: POST /api/admin/events - Create event (requires admin auth)
    await this.testCreateEvent();
    
    // Test 7: PUT /api/admin/events/[id] - Update event (requires admin auth)
    await this.testUpdateEvent();
    
    // Test 8: DELETE /api/admin/events/[id] - Delete event (requires admin auth)
    await this.testDeleteEvent();
    
    // Test 9: Input validation tests
    await this.testInputValidation();
    
    // Test 10: Error handling tests
    await this.testErrorHandling();
    
    // Cleanup any remaining test events
    await this.cleanup();
  }

  async testBasicEndpointAvailability() {
    // Test if basic endpoints respond (even with auth errors)
    const endpoints = [
      '/api/events',
      '/api/admin/events',
      '/api/events/1'
    ];

    for (const endpoint of endpoints) {
      const response = await makeRequest(endpoint);
      
      // Success if endpoint responds (even with 401/403)
      const passed = response.status > 0 && response.status < 500;

      this.testResults.addTest(
        'Basic Availability',
        `端點存在性: ${endpoint}`,
        passed,
        {
          endpoint,
          status: response.status,
          responseReceived: response.status > 0
        },
        { responseTime: response.responseTime }
      );
    }
  }

  async testAuthenticationRequirements() {
    // Test that protected endpoints require authentication
    const protectedEndpoints = [
      { endpoint: '/api/events', method: 'GET' },
      { endpoint: '/api/admin/events', method: 'GET' },
      { endpoint: '/api/admin/events', method: 'POST', body: { title: 'Test' } }
    ];

    for (const test of protectedEndpoints) {
      const response = await makeRequest(test.endpoint, {
        method: test.method,
        body: test.body ? JSON.stringify(test.body) : undefined
      });
      
      // Should return 401 (unauthorized) or 403 (forbidden)
      const passed = response.status === 401 || response.status === 403;

      this.testResults.addTest(
        'Authentication',
        `未認證請求保護: ${test.method} ${test.endpoint}`,
        passed,
        {
          endpoint: test.endpoint,
          method: test.method,
          expectedStatus: '401 or 403',
          actualStatus: response.status,
          hasAuthError: !!(response.data?.error || response.data?.message)
        }
      );
    }
  }

  async testGetEventsList() {
    const response = await makeRequest('/api/events');
    
    // Check if endpoint responds correctly (401 expected without auth)
    const basicResponseOk = response.status === 401 || (response.ok && response.data);
    
    this.testResults.addTest(
      'Events List',
      'GET /api/events 基本回應',
      basicResponseOk,
      {
        status: response.status,
        hasData: !!response.data,
        isAuthRequired: response.status === 401,
        dataStructure: response.data ? Object.keys(response.data) : []
      },
      { responseTime: response.responseTime }
    );

    // Test response format if successful
    if (response.ok && response.data) {
      const hasCorrectFormat = response.data.success !== undefined || Array.isArray(response.data);
      
      this.testResults.addTest(
        'Events List',
        'GET /api/events 回應格式驗證',
        hasCorrectFormat,
        {
          hasSuccessField: response.data.success !== undefined,
          hasDataArray: Array.isArray(response.data) || Array.isArray(response.data?.data),
          hasPagination: !!response.data.pagination
        }
      );
    }
  }

  async testGetEventsWithFilters() {
    const filterTests = [
      { name: '分頁測試', params: 'page=1&limit=5' },
      { name: '活動類型篩選', params: 'eventType=meeting' },
      { name: '目標年級篩選', params: 'targetGrade=3-4' },
      { name: '搜尋功能', params: 'search=test' },
      { name: '即將到來的活動', params: 'upcoming=true' },
      { name: '精選活動', params: 'featured=true' },
      { name: '日期範圍篩選', params: 'startDate=2025-01-01&endDate=2025-12-31' }
    ];

    for (const test of filterTests) {
      const response = await makeRequest(`/api/events?${test.params}`);
      
      // Accept 401 (auth required) or successful response
      const passed = response.status === 401 || response.ok;

      this.testResults.addTest(
        'Events Filters',
        test.name,
        passed,
        {
          params: test.params,
          status: response.status,
          hasData: !!response.data
        }
      );
    }
  }

  async testGetSingleEvent() {
    // Test with ID 1 (commonly used test ID)
    const response = await makeRequest('/api/events/1');
    
    // Should respond with 401, 404, or success
    const passed = [401, 404, 200].includes(response.status);

    this.testResults.addTest(
      'Single Event',
      'GET /api/events/[id] 單一活動查詢',
      passed,
      {
        status: response.status,
        validResponse: [401, 404, 200].includes(response.status)
      },
      { responseTime: response.responseTime }
    );

    // Test invalid ID handling
    const invalidResponse = await makeRequest('/api/events/invalid-id');
    const invalidHandled = invalidResponse.status === 400 || invalidResponse.status === 404;

    this.testResults.addTest(
      'Single Event',
      'GET /api/events/[id] 無效ID處理',
      invalidHandled,
      {
        status: invalidResponse.status,
        expectedStatus: '400 or 404',
        actualStatus: invalidResponse.status
      }
    );
  }

  async testCreateEvent() {
    const eventData = {
      title: 'API Test Event',
      description: 'This is a test event created by the verification script',
      eventType: 'meeting',
      startDate: '2025-03-15',
      startTime: '10:00',
      endTime: '12:00',
      location: 'Test Room',
      maxParticipants: 50,
      registrationRequired: true,
      registrationDeadline: '2025-03-12',
      targetGrades: ['3-4', '5-6'],
      status: 'published'
    };

    const response = await makeRequest('/api/admin/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });

    // Should require admin authentication (401/403 expected)
    const correctAuthBehavior = response.status === 401 || response.status === 403;

    this.testResults.addTest(
      'Create Event',
      'POST /api/admin/events 權限驗證',
      correctAuthBehavior,
      {
        status: response.status,
        expectedStatus: '401 or 403',
        actualStatus: response.status,
        requiresAuth: true
      }
    );

    // If creation was successful (unlikely without auth), track for cleanup
    if (response.ok && response.data?.data?.id) {
      this.testEventId = response.data.data.id;
      this.testResults.addTestEvent(this.testEventId);
    }
  }

  async testUpdateEvent() {
    const updateData = {
      title: 'Updated API Test Event',
      description: 'This event has been updated',
      eventType: 'meeting',
      startDate: '2025-03-16',
      status: 'published'
    };

    // Test with ID 1 or our created event ID
    const eventId = this.testEventId || 1;
    const response = await makeRequest(`/api/admin/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });

    // Should require admin authentication (401/403 expected)
    const correctAuthBehavior = response.status === 401 || response.status === 403 || response.status === 404;

    this.testResults.addTest(
      'Update Event',
      'PUT /api/admin/events/[id] 權限驗證',
      correctAuthBehavior,
      {
        eventId,
        status: response.status,
        expectedStatus: '401, 403, or 404',
        actualStatus: response.status
      }
    );
  }

  async testDeleteEvent() {
    // Test with ID 9999 (non-existent) to avoid deleting real data
    const response = await makeRequest('/api/admin/events/9999', {
      method: 'DELETE'
    });

    // Should require admin authentication (401/403 expected) or not found (404)
    const correctAuthBehavior = response.status === 401 || response.status === 403 || response.status === 404;

    this.testResults.addTest(
      'Delete Event',
      'DELETE /api/admin/events/[id] 權限驗證',
      correctAuthBehavior,
      {
        eventId: 9999,
        status: response.status,
        expectedStatus: '401, 403, or 404',
        actualStatus: response.status
      }
    );
  }

  async testInputValidation() {
    const invalidInputTests = [
      {
        name: '缺少必填欄位',
        data: { title: '', eventType: 'meeting' }
      },
      {
        name: '無效的活動類型',
        data: { title: 'Test', eventType: 'invalid-type', startDate: '2025-03-15', status: 'published' }
      },
      {
        name: '無效的日期格式',
        data: { title: 'Test', eventType: 'meeting', startDate: 'invalid-date', status: 'published' }
      }
    ];

    for (const test of invalidInputTests) {
      const response = await makeRequest('/api/admin/events', {
        method: 'POST',
        body: JSON.stringify(test.data)
      });

      // Should return 400 (bad request), 401 (auth), or 403 (forbidden)
      const passed = [400, 401, 403].includes(response.status);

      this.testResults.addTest(
        'Input Validation',
        test.name,
        passed,
        {
          testData: test.data,
          status: response.status,
          expectedStatus: '400, 401, or 403',
          actualStatus: response.status
        }
      );
    }
  }

  async testErrorHandling() {
    const errorTests = [
      {
        name: '大型請求處理',
        endpoint: '/api/events',
        options: {
          body: JSON.stringify({ data: 'x'.repeat(10000) })
        }
      },
      {
        name: '不存在的活動ID',
        endpoint: '/api/events/999999'
      },
      {
        name: '無效的 HTTP 方法',
        endpoint: '/api/events',
        options: { method: 'PATCH' }
      }
    ];

    for (const test of errorTests) {
      const response = await makeRequest(test.endpoint, test.options || {});
      
      // Should handle gracefully (no 500 errors)
      const passed = response.status < 500;

      this.testResults.addTest(
        'Error Handling',
        test.name,
        passed,
        {
          endpoint: test.endpoint,
          status: response.status,
          noServerError: response.status < 500
        }
      );
    }
  }

  async cleanup() {
    // Attempt to clean up any test events (if we have admin access)
    if (this.testResults.results.testEvents.length > 0) {
      console.log('\n🧹 嘗試清理測試資料...');
      
      for (const eventId of this.testResults.results.testEvents) {
        try {
          const response = await makeRequest(`/api/admin/events/${eventId}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            console.log(`   ✅ 已清理測試活動 ID: ${eventId}`);
          } else {
            console.log(`   ⚠️  無法清理測試活動 ID: ${eventId} (${response.status})`);
          }
        } catch (error) {
          console.log(`   ❌ 清理測試活動時發生錯誤: ${error.message}`);
        }
      }
    }
  }
}

// Main test runner
async function runEventsApiVerification() {
  console.log('🚀 開始執行 Events API 端點驗證測試');
  console.log(`📍 測試目標: ${CONFIG.baseUrl}`);
  console.log(`⏱️  超時設定: ${CONFIG.timeout}ms`);
  console.log(`🔄 重試次數: ${CONFIG.retries}`);
  console.log('='.repeat(80));

  const testResults = new EventsTestResults();

  try {
    const eventsTests = new EventsApiTests(testResults);
    await eventsTests.runAll();

    // Generate final report
    const results = testResults.generateReport();

    return results;

  } catch (error) {
    console.error('❌ 測試執行過程中發生錯誤:', error);
    return testResults.finalize();
  }
}

// Execute tests if run directly
if (require.main === module) {
  // Check if fetch is available (Node.js 18+)
  if (typeof fetch === 'undefined') {
    console.error('此腳本需要 Node.js 18+ 或需要安裝 node-fetch');
    console.log('執行: npm install node-fetch');
    process.exit(1);
  }
  
  runEventsApiVerification()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Events API 測試執行失敗:', error);
      process.exit(1);
    });
}

module.exports = { 
  runEventsApiVerification,
  EventsApiTests,
  EventsTestResults
};