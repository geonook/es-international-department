#!/usr/bin/env node

/**
 * 公告管理系統全面測試腳本
 * Comprehensive Test Script for Announcement Management System
 */

const fs = require('fs');
const path = require('path');

// 測試配置
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  testUser: {
    email: 'admin@test.com',
    password: 'admin123'
  },
  timeout: 30000,
  outputFile: path.join(__dirname, 'test-results.json')
};

// 測試結果存儲
let testResults = {
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  },
  tests: {}
};

// 輔助函數
class TestRunner {
  constructor() {
    this.authToken = null;
    this.testAnnouncement = null;
  }

  // HTTP 請求輔助函數
  async makeRequest(endpoint, options = {}) {
    const url = `${CONFIG.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        timeout: CONFIG.timeout
      });

      const data = await response.text();
      let jsonData;
      try {
        jsonData = JSON.parse(data);
      } catch {
        jsonData = { text: data };
      }

      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: jsonData
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        statusText: 'Network Error',
        error: error.message
      };
    }
  }

  // 記錄測試結果
  logTest(category, testName, passed, details = {}) {
    if (!testResults.tests[category]) {
      testResults.tests[category] = {};
    }
    
    testResults.tests[category][testName] = {
      passed,
      details,
      timestamp: new Date().toISOString()
    };

    testResults.summary.total++;
    if (passed) {
      testResults.summary.passed++;
      console.log(`✅ ${category} - ${testName}`);
    } else {
      testResults.summary.failed++;
      testResults.summary.errors.push(`${category} - ${testName}: ${JSON.stringify(details)}`);
      console.log(`❌ ${category} - ${testName}:`, details);
    }
  }

  // 1. API 端點測試
  async testApiEndpoints() {
    console.log('\n🔍 開始 API 端點測試...');

    // 測試健康檢查端點
    try {
      const healthResponse = await this.makeRequest('/api/health');
      this.logTest('API', 'Health Check', healthResponse.ok, {
        status: healthResponse.status,
        response: healthResponse.data
      });
    } catch (error) {
      this.logTest('API', 'Health Check', false, { error: error.message });
    }

    // 測試公告列表 GET /api/announcements
    try {
      const listResponse = await this.makeRequest('/api/announcements');
      const success = listResponse.ok && listResponse.data.success;
      this.logTest('API', 'GET /api/announcements (基本查詢)', success, {
        status: listResponse.status,
        hasData: !!listResponse.data.data,
        hasPagination: !!listResponse.data.pagination
      });
    } catch (error) {
      this.logTest('API', 'GET /api/announcements (基本查詢)', false, { error: error.message });
    }

    // 測試帶參數的公告列表查詢
    const testQueries = [
      { name: '分頁查詢', params: 'page=1&limit=5' },
      { name: '篩選目標對象', params: 'targetAudience=teachers' },
      { name: '篩選優先級', params: 'priority=high' },
      { name: '篩選狀態', params: 'status=published' },
      { name: '搜尋功能', params: 'search=test' },
      { name: '複合篩選', params: 'targetAudience=all&priority=medium&status=published&page=1&limit=10' }
    ];

    for (const query of testQueries) {
      try {
        const response = await this.makeRequest(`/api/announcements?${query.params}`);
        const success = response.ok && response.data.success;
        this.logTest('API', `GET /api/announcements (${query.name})`, success, {
          status: response.status,
          params: query.params,
          hasFilters: !!response.data.filters
        });
      } catch (error) {
        this.logTest('API', `GET /api/announcements (${query.name})`, false, { error: error.message });
      }
    }

    // 測試創建公告 (需要認證)
    const testAnnouncementData = {
      title: '測試公告 - ' + Date.now(),
      content: '這是一個測試公告的內容，用於驗證系統功能是否正常運作。',
      summary: '測試公告摘要',
      targetAudience: 'all',
      priority: 'medium',
      status: 'draft'
    };

    try {
      const createResponse = await this.makeRequest('/api/announcements', {
        method: 'POST',
        body: JSON.stringify(testAnnouncementData)
      });

      const success = createResponse.status === 201 && createResponse.data.success;
      if (success) {
        this.testAnnouncement = createResponse.data.data;
      }

      this.logTest('API', 'POST /api/announcements (創建公告)', success, {
        status: createResponse.status,
        requiresAuth: createResponse.status === 401,
        created: !!this.testAnnouncement
      });
    } catch (error) {
      this.logTest('API', 'POST /api/announcements (創建公告)', false, { error: error.message });
    }

    // 測試單一公告查詢
    if (this.testAnnouncement) {
      try {
        const getResponse = await this.makeRequest(`/api/announcements/${this.testAnnouncement.id}`);
        const success = getResponse.ok && getResponse.data.success;
        this.logTest('API', 'GET /api/announcements/[id] (單一公告)', success, {
          status: getResponse.status,
          foundAnnouncement: !!getResponse.data.data
        });
      } catch (error) {
        this.logTest('API', 'GET /api/announcements/[id] (單一公告)', false, { error: error.message });
      }

      // 測試更新公告
      try {
        const updateData = {
          title: this.testAnnouncement.title + ' (已更新)',
          status: 'published'
        };

        const updateResponse = await this.makeRequest(`/api/announcements/${this.testAnnouncement.id}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });

        const success = updateResponse.ok && updateResponse.data.success;
        this.logTest('API', 'PUT /api/announcements/[id] (更新公告)', success, {
          status: updateResponse.status,
          requiresAuth: updateResponse.status === 401 || updateResponse.status === 403
        });
      } catch (error) {
        this.logTest('API', 'PUT /api/announcements/[id] (更新公告)', false, { error: error.message });
      }

      // 測試刪除公告
      try {
        const deleteResponse = await this.makeRequest(`/api/announcements/${this.testAnnouncement.id}`, {
          method: 'DELETE'
        });

        const success = deleteResponse.ok && deleteResponse.data.success;
        this.logTest('API', 'DELETE /api/announcements/[id] (刪除公告)', success, {
          status: deleteResponse.status,
          requiresAuth: deleteResponse.status === 401 || deleteResponse.status === 403
        });
      } catch (error) {
        this.logTest('API', 'DELETE /api/announcements/[id] (刪除公告)', false, { error: error.message });
      }
    }

    // 測試無效 ID
    try {
      const invalidResponse = await this.makeRequest('/api/announcements/invalid-id');
      const expectError = invalidResponse.status === 400;
      this.logTest('API', '無效 ID 處理', expectError, {
        status: invalidResponse.status,
        expectError400: expectError
      });
    } catch (error) {
      this.logTest('API', '無效 ID 處理', false, { error: error.message });
    }

    // 測試不存在的公告
    try {
      const notFoundResponse = await this.makeRequest('/api/announcements/999999');
      const expectNotFound = notFoundResponse.status === 404;
      this.logTest('API', '不存在公告處理', expectNotFound, {
        status: notFoundResponse.status,
        expectError404: expectNotFound
      });
    } catch (error) {
      this.logTest('API', '不存在公告處理', false, { error: error.message });
    }
  }

  // 2. 資料驗證測試
  async testDataValidation() {
    console.log('\n🔍 開始資料驗證測試...');

    const invalidData = [
      {
        name: '空標題',
        data: { title: '', content: '內容', targetAudience: 'all', priority: 'medium', status: 'draft' }
      },
      {
        name: '空內容',
        data: { title: '標題', content: '', targetAudience: 'all', priority: 'medium', status: 'draft' }
      },
      {
        name: '無效目標對象',
        data: { title: '標題', content: '內容', targetAudience: 'invalid', priority: 'medium', status: 'draft' }
      },
      {
        name: '無效優先級',
        data: { title: '標題', content: '內容', targetAudience: 'all', priority: 'invalid', status: 'draft' }
      },
      {
        name: '無效狀態',
        data: { title: '標題', content: '內容', targetAudience: 'all', priority: 'medium', status: 'invalid' }
      },
      {
        name: '過長標題',
        data: { title: 'x'.repeat(201), content: '內容', targetAudience: 'all', priority: 'medium', status: 'draft' }
      },
      {
        name: '過長內容',
        data: { title: '標題', content: 'x'.repeat(10001), targetAudience: 'all', priority: 'medium', status: 'draft' }
      }
    ];

    for (const test of invalidData) {
      try {
        const response = await this.makeRequest('/api/announcements', {
          method: 'POST',
          body: JSON.stringify(test.data)
        });

        const expectError = response.status === 400;
        this.logTest('驗證', `資料驗證 - ${test.name}`, expectError, {
          status: response.status,
          expectError400: expectError,
          message: response.data.message
        });
      } catch (error) {
        this.logTest('驗證', `資料驗證 - ${test.name}`, false, { error: error.message });
      }
    }
  }

  // 3. 權限控制測試
  async testPermissions() {
    console.log('\n🔍 開始權限控制測試...');

    // 測試未認證的請求
    const authRequiredEndpoints = [
      { method: 'POST', endpoint: '/api/announcements', name: '創建公告' },
      { method: 'PUT', endpoint: '/api/announcements/1', name: '更新公告' },
      { method: 'DELETE', endpoint: '/api/announcements/1', name: '刪除公告' }
    ];

    for (const endpoint of authRequiredEndpoints) {
      try {
        const response = await this.makeRequest(endpoint.endpoint, {
          method: endpoint.method,
          body: endpoint.method !== 'DELETE' ? JSON.stringify({
            title: '測試',
            content: '測試內容',
            targetAudience: 'all',
            priority: 'medium',
            status: 'draft'
          }) : undefined
        });

        const expectUnauthorized = response.status === 401;
        this.logTest('權限', `未認證請求 - ${endpoint.name}`, expectUnauthorized, {
          status: response.status,
          expectError401: expectUnauthorized
        });
      } catch (error) {
        this.logTest('權限', `未認證請求 - ${endpoint.name}`, false, { error: error.message });
      }
    }
  }

  // 4. 邊界情況測試
  async testEdgeCases() {
    console.log('\n🔍 開始邊界情況測試...');

    // 測試空結果
    try {
      const response = await this.makeRequest('/api/announcements?search=不存在的搜尋詞xyz123');
      const success = response.ok && response.data.success && response.data.data.length === 0;
      this.logTest('邊界', '空搜尋結果', success, {
        status: response.status,
        hasEmptyData: response.data.data?.length === 0
      });
    } catch (error) {
      this.logTest('邊界', '空搜尋結果', false, { error: error.message });
    }

    // 測試大分頁數
    try {
      const response = await this.makeRequest('/api/announcements?page=999999&limit=1');
      const success = response.ok;  // 應該返回空結果但不出錯
      this.logTest('邊界', '大分頁數處理', success, {
        status: response.status,
        totalPages: response.data.pagination?.totalPages
      });
    } catch (error) {
      this.logTest('邊界', '大分頁數處理', false, { error: error.message });
    }

    // 測試無效分頁參數
    const invalidPageParams = [
      'page=-1&limit=10',
      'page=0&limit=10',
      'page=1&limit=0',
      'page=1&limit=101',  // 假設有最大限制
      'page=abc&limit=10',
      'page=1&limit=xyz'
    ];

    for (const params of invalidPageParams) {
      try {
        const response = await this.makeRequest(`/api/announcements?${params}`);
        // 應該要麼正常處理（使用預設值），要麼返回錯誤
        const handled = response.ok || response.status === 400;
        this.logTest('邊界', `無效分頁參數 - ${params}`, handled, {
          status: response.status,
          params
        });
      } catch (error) {
        this.logTest('邊界', `無效分頁參數 - ${params}`, false, { error: error.message });
      }
    }
  }

  // 5. 性能測試（基本）
  async testPerformance() {
    console.log('\n🔍 開始基本性能測試...');

    // 測試並發請求
    const concurrentRequests = 5;
    const startTime = Date.now();

    try {
      const requests = Array(concurrentRequests).fill().map(() => 
        this.makeRequest('/api/announcements')
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / concurrentRequests;

      const allSuccessful = responses.every(r => r.ok);
      this.logTest('性能', '並發請求處理', allSuccessful, {
        concurrentRequests,
        totalTime: `${totalTime}ms`,
        avgTime: `${avgTime.toFixed(2)}ms`,
        allSuccessful
      });
    } catch (error) {
      this.logTest('性能', '並發請求處理', false, { error: error.message });
    }

    // 測試響應時間
    const iterations = 3;
    const responseTimes = [];

    for (let i = 0; i < iterations; i++) {
      try {
        const start = Date.now();
        const response = await this.makeRequest('/api/announcements');
        const end = Date.now();
        
        if (response.ok) {
          responseTimes.push(end - start);
        }
      } catch (error) {
        // 忽略個別請求錯誤
      }
    }

    if (responseTimes.length > 0) {
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const acceptable = avgResponseTime < 2000;  // 2秒內算可接受
      
      this.logTest('性能', '平均響應時間', acceptable, {
        iterations: responseTimes.length,
        avgTime: `${avgResponseTime.toFixed(2)}ms`,
        maxTime: `${Math.max(...responseTimes)}ms`,
        minTime: `${Math.min(...responseTimes)}ms`,
        acceptable: `< 2000ms`
      });
    } else {
      this.logTest('性能', '平均響應時間', false, { error: '無法測量響應時間' });
    }
  }

  // 6. 資料完整性測試
  async testDataIntegrity() {
    console.log('\n🔍 開始資料完整性測試...');

    try {
      const response = await this.makeRequest('/api/announcements');
      
      if (response.ok && response.data.success) {
        const announcements = response.data.data;
        let integrityPassed = true;
        const issues = [];

        // 檢查每個公告的必要欄位
        for (const announcement of announcements) {
          const requiredFields = ['id', 'title', 'content', 'targetAudience', 'priority', 'status', 'createdAt'];
          
          for (const field of requiredFields) {
            if (!announcement.hasOwnProperty(field) || announcement[field] === null || announcement[field] === undefined) {
              integrityPassed = false;
              issues.push(`公告 ${announcement.id || 'unknown'} 缺少欄位: ${field}`);
            }
          }

          // 檢查枚舉值
          const validTargetAudiences = ['teachers', 'parents', 'all'];
          const validPriorities = ['low', 'medium', 'high'];
          const validStatuses = ['draft', 'published', 'archived'];

          if (!validTargetAudiences.includes(announcement.targetAudience)) {
            integrityPassed = false;
            issues.push(`公告 ${announcement.id} 有無效的目標對象: ${announcement.targetAudience}`);
          }

          if (!validPriorities.includes(announcement.priority)) {
            integrityPassed = false;
            issues.push(`公告 ${announcement.id} 有無效的優先級: ${announcement.priority}`);
          }

          if (!validStatuses.includes(announcement.status)) {
            integrityPassed = false;
            issues.push(`公告 ${announcement.id} 有無效的狀態: ${announcement.status}`);
          }
        }

        this.logTest('完整性', '資料欄位完整性', integrityPassed, {
          totalAnnouncements: announcements.length,
          issues: issues.slice(0, 5)  // 只顯示前5個問題
        });

        // 檢查分頁資訊準確性
        const pagination = response.data.pagination;
        if (pagination) {
          const paginationValid = 
            pagination.totalCount >= announcements.length &&
            pagination.totalPages >= 1 &&
            pagination.page >= 1 &&
            pagination.limit >= 1;

          this.logTest('完整性', '分頁資訊準確性', paginationValid, {
            pagination,
            dataLength: announcements.length
          });
        }
      } else {
        this.logTest('完整性', '資料欄位完整性', false, { error: '無法獲取公告資料' });
      }
    } catch (error) {
      this.logTest('完整性', '資料欄位完整性', false, { error: error.message });
    }
  }

  // 執行所有測試
  async runAllTests() {
    console.log('🚀 開始執行公告管理系統全面測試...\n');
    
    const startTime = Date.now();

    try {
      await this.testApiEndpoints();
      await this.testDataValidation();
      await this.testPermissions();
      await this.testEdgeCases();
      await this.testPerformance();
      await this.testDataIntegrity();
    } catch (error) {
      console.error('測試執行錯誤:', error);
      testResults.summary.errors.push(`測試執行錯誤: ${error.message}`);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // 完成測試摘要
    testResults.summary.totalTime = `${totalTime}ms`;
    testResults.summary.completedAt = new Date().toISOString();
    testResults.summary.passRate = `${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`;

    // 輸出結果
    console.log('\n📊 測試結果摘要:');
    console.log(`總測試數: ${testResults.summary.total}`);
    console.log(`通過: ${testResults.summary.passed}`);
    console.log(`失敗: ${testResults.summary.failed}`);
    console.log(`通過率: ${testResults.summary.passRate}`);
    console.log(`總耗時: ${testResults.summary.totalTime}`);

    if (testResults.summary.failed > 0) {
      console.log('\n❌ 失敗的測試:');
      testResults.summary.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('\n🎉 所有測試都通過了！');
    }

    // 保存詳細結果到文件
    try {
      fs.writeFileSync(CONFIG.outputFile, JSON.stringify(testResults, null, 2), 'utf8');
      console.log(`\n📄 詳細測試結果已保存到: ${CONFIG.outputFile}`);
    } catch (error) {
      console.error('保存測試結果失敗:', error.message);
    }

    return testResults;
  }
}

// 執行測試
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().then(() => {
    process.exit(testResults.summary.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('測試運行失敗:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;