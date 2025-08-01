#!/usr/bin/env node

/**
 * 重點功能測試腳本
 * Focused Feature Test Script
 */

const baseUrl = 'http://localhost:3000';

async function makeRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 開始重點功能測試\n');

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

  // 1. 測試健康檢查
  const health = await makeRequest('/api/health');
  logResult('Health Check', health.ok && health.data.status === 'OK', {
    status: health.status,
    service: health.data?.service
  });

  // 2. 測試公告列表基本功能
  const list = await makeRequest('/api/announcements');
  logResult('公告列表查詢', list.ok && list.data.success, {
    status: list.status,
    count: list.data?.data?.length,
    hasPagination: !!list.data?.pagination
  });

  if (list.ok && list.data.data) {
    // 3. 測試單一公告查詢
    const firstAnnouncement = list.data.data[0];
    if (firstAnnouncement) {
      const single = await makeRequest(`/api/announcements/${firstAnnouncement.id}`);
      logResult('單一公告查詢', single.ok && single.data.success, {
        status: single.status,
        id: firstAnnouncement.id,
        found: !!single.data?.data
      });
    }
  }

  // 4. 測試篩選功能
  const filters = [
    { name: '篩選教師公告', params: 'targetAudience=teachers' },
    { name: '篩選家長公告', params: 'targetAudience=parents' },
    { name: '高優先級篩選', params: 'priority=high' },
    { name: '搜尋功能', params: 'search=welcome' }
  ];

  for (const filter of filters) {
    const filtered = await makeRequest(`/api/announcements?${filter.params}`);
    logResult(filter.name, filtered.ok && filtered.data.success, {
      status: filtered.status,
      params: filter.params,
      count: filtered.data?.data?.length
    });
  }

  // 5. 測試分頁功能
  const pagination = await makeRequest('/api/announcements?page=1&limit=1');
  logResult('分頁功能', pagination.ok && pagination.data.success, {
    status: pagination.status,
    page: pagination.data?.pagination?.page,
    limit: pagination.data?.pagination?.limit,
    total: pagination.data?.pagination?.totalCount
  });

  // 6. 測試權限控制（應該要求認證）
  const createTest = await makeRequest('/api/announcements', {
    method: 'POST',
    body: JSON.stringify({
      title: '測試公告',
      content: '測試內容',
      targetAudience: 'all',
      priority: 'medium',
      status: 'draft'
    })
  });
  logResult('權限控制測試', createTest.status === 401, {
    status: createTest.status,
    expectUnauthorized: createTest.status === 401
  });

  // 7. 測試無效 ID 處理
  const invalidId = await makeRequest('/api/announcements/invalid');
  logResult('無效 ID 處理', invalidId.status === 400, {
    status: invalidId.status,
    expectBadRequest: invalidId.status === 400
  });

  // 8. 測試不存在的公告
  const notFound = await makeRequest('/api/announcements/999999');
  logResult('不存在公告處理', notFound.status === 404, {
    status: notFound.status,
    expectNotFound: notFound.status === 404
  });

  // 9. 測試資料完整性
  if (list.ok && list.data.data && list.data.data.length > 0) {
    const announcement = list.data.data[0];
    const requiredFields = ['id', 'title', 'content', 'targetAudience', 'priority', 'status', 'createdAt'];
    const hasAllFields = requiredFields.every(field => announcement.hasOwnProperty(field) && announcement[field] !== null);
    
    logResult('資料完整性檢查', hasAllFields, {
      checkedFields: requiredFields,
      missingFields: requiredFields.filter(field => !announcement.hasOwnProperty(field) || announcement[field] === null)
    });

    // 10. 檢查枚舉值有效性
    const validTargetAudiences = ['teachers', 'parents', 'all'];
    const validPriorities = ['low', 'medium', 'high'];
    const validStatuses = ['draft', 'published', 'archived'];
    
    const validEnums = 
      validTargetAudiences.includes(announcement.targetAudience) &&
      validPriorities.includes(announcement.priority) &&
      validStatuses.includes(announcement.status);
    
    logResult('枚舉值有效性', validEnums, {
      targetAudience: announcement.targetAudience,
      priority: announcement.priority,
      status: announcement.status
    });
  }

  // 輸出測試摘要
  console.log('\n📊 測試結果摘要:');
  console.log(`總測試數: ${results.passed + results.failed}`);
  console.log(`通過: ${results.passed}`);
  console.log(`失敗: ${results.failed}`);
  console.log(`通過率: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`);

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
  runTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('測試運行失敗:', error);
    process.exit(1);
  });
}

module.exports = { runTests };