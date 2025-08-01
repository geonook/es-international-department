#!/usr/bin/env node

/**
 * 整合測試腳本 - 前後端完整流程測試
 * Integration Test Script - Complete Frontend/Backend Flow
 */

async function makeRequest(endpoint, options = {}) {
  const baseUrl = process.env.TEST_BASE_URL || 'https://landing-app-v2.zeabur.app';
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

async function runIntegrationTests() {
  console.log('🚀 開始整合測試 - 前後端完整流程\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
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

  // 1. 完整的公告查詢流程測試
  console.log('📋 測試公告查詢流程...');
  
  // 獲取公告列表
  const announcements = await makeRequest('/api/announcements');
  logResult('獲取公告列表', announcements.ok && announcements.data.success, {
    status: announcements.status,
    count: announcements.data?.data?.length,
    hasPagination: !!announcements.data?.pagination
  });

  let testAnnouncementId = null;
  if (announcements.ok && announcements.data.data.length > 0) {
    testAnnouncementId = announcements.data.data[0].id;
    
    // 獲取單一公告詳情
    const singleAnnouncement = await makeRequest(`/api/announcements/${testAnnouncementId}`);
    logResult('獲取單一公告詳情', singleAnnouncement.ok && singleAnnouncement.data.success, {
      status: singleAnnouncement.status,
      id: testAnnouncementId,
      hasAuthor: !!singleAnnouncement.data?.data?.author
    });
  }

  // 2. 測試不同篩選條件的數據一致性
  console.log('\n🔍 測試篩選功能一致性...');
  
  const filterTests = [
    { name: '教師公告篩選', filter: 'targetAudience=teachers' },
    { name: '家長公告篩選', filter: 'targetAudience=parents' },
    { name: '所有對象篩選', filter: 'targetAudience=all' },
    { name: '高優先級篩選', filter: 'priority=high' },
    { name: '已發布狀態篩選', filter: 'status=published' }
  ];

  for (const test of filterTests) {
    const filtered = await makeRequest(`/api/announcements?${test.filter}`);
    const success = filtered.ok && filtered.data.success;
    
    // 驗證篩選結果的一致性
    let consistencyCheck = true;
    if (success && filtered.data.data.length > 0) {
      const filterKey = test.filter.split('=')[0];
      const filterValue = test.filter.split('=')[1];
      
      // 檢查每個結果是否符合篩選條件
      for (const item of filtered.data.data) {
        if (item[filterKey] !== filterValue) {
          consistencyCheck = false;
          break;
        }
      }
    }
    
    logResult(test.name, success && consistencyCheck, {
      status: filtered.status,
      count: filtered.data?.data?.length,
      consistencyCheck,
      filter: test.filter
    });
  }

  // 3. 測試分頁邏輯的正確性
  console.log('\n📄 測試分頁邏輯...');
  
  const page1 = await makeRequest('/api/announcements?page=1&limit=1');
  const page2 = await makeRequest('/api/announcements?page=2&limit=1');
  
  if (page1.ok && page2.ok && page1.data.success && page2.data.success) {
    const totalCount = page1.data.pagination.totalCount;
    const page1HasData = page1.data.data.length > 0;
    const page2HasData = page2.data.data.length > 0;
    const differentData = page1HasData && page2HasData ? 
      page1.data.data[0].id !== page2.data.data[0].id : true;
    
    logResult('分頁邏輯正確性', page1HasData && (totalCount <= 1 || differentData), {
      totalCount,
      page1Count: page1.data.data.length,
      page2Count: page2.data.data.length,
      differentData
    });
  } else {
    logResult('分頁邏輯正確性', false, {
      page1Status: page1.status,
      page2Status: page2.status
    });
  }

  // 4. 測試搜尋功能的有效性
  console.log('\n🔍 測試搜尋功能...');
  
  if (announcements.ok && announcements.data.data.length > 0) {
    const firstAnnouncement = announcements.data.data[0];
    const searchTerm = firstAnnouncement.title.split(' ')[0]; // 取標題第一個字
    
    const searchResult = await makeRequest(`/api/announcements?search=${encodeURIComponent(searchTerm)}`);
    
    let searchWorking = false;
    if (searchResult.ok && searchResult.data.success) {
      // 檢查搜尋結果是否包含搜尋詞
      searchWorking = searchResult.data.data.some(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    logResult('搜尋功能有效性', searchWorking, {
      searchTerm,
      resultCount: searchResult.data?.data?.length,
      hasRelevantResults: searchWorking
    });
  }

  // 5. 測試權限控制的一致性
  console.log('\n🔒 測試權限控制一致性...');
  
  const authRequiredEndpoints = [
    { method: 'POST', endpoint: '/api/announcements', name: '創建公告' },
    { method: 'PUT', endpoint: `/api/announcements/${testAnnouncementId || 1}`, name: '更新公告' },
    { method: 'DELETE', endpoint: `/api/announcements/${testAnnouncementId || 1}`, name: '刪除公告' }
  ];

  for (const endpoint of authRequiredEndpoints) {
    const response = await makeRequest(endpoint.endpoint, {
      method: endpoint.method,
      body: endpoint.method !== 'DELETE' ? JSON.stringify({
        title: '測試',
        content: '測試內容',
        targetAudience: 'all',
        priority: 'medium',
        status: 'draft'
      }) : undefined
    });

    const correctlyDenied = response.status === 401;
    logResult(`權限控制 - ${endpoint.name}`, correctlyDenied, {
      status: response.status,
      expectedUnauthorized: true,
      actuallyDenied: correctlyDenied
    });
  }

  // 6. 測試錯誤處理的一致性
  console.log('\n⚠️  測試錯誤處理...');
  
  const errorTests = [
    { 
      name: '無效公告ID處理', 
      request: () => makeRequest('/api/announcements/invalid-id'),
      expectedStatus: 400
    },
    { 
      name: '不存在公告處理', 
      request: () => makeRequest('/api/announcements/999999'),
      expectedStatus: 404
    },
    {
      name: '無效資料創建處理',
      request: () => makeRequest('/api/announcements', {
        method: 'POST',
        body: JSON.stringify({ title: '', content: '' }) // 無效資料
      }),
      expectedStatus: 400
    }
  ];

  for (const test of errorTests) {
    const response = await test.request();
    const correctErrorHandling = response.status === test.expectedStatus;
    
    logResult(test.name, correctErrorHandling, {
      actualStatus: response.status,
      expectedStatus: test.expectedStatus,
      hasErrorMessage: !!response.data?.message || !!response.data?.error
    });
  }

  // 7. 測試 API 響應格式的一致性
  console.log('\n📊 測試 API 響應格式一致性...');
  
  const apiEndpoints = [
    '/api/announcements',
    `/api/announcements/${testAnnouncementId || 1}`,
    '/api/announcements?page=1&limit=5'
  ];

  for (const endpoint of apiEndpoints) {
    const response = await makeRequest(endpoint);
    if (response.ok && response.data) {
      const hasStandardFormat = response.data.hasOwnProperty('success');
      const hasData = response.data.hasOwnProperty('data');
      const validStructure = hasStandardFormat && (hasData || response.data.hasOwnProperty('message'));
      
      logResult(`API 格式一致性 - ${endpoint}`, validStructure, {
        hasSuccess: hasStandardFormat,
        hasData,
        hasMessage: response.data.hasOwnProperty('message'),
        status: response.status
      });
    }
  }

  // 8. 測試系統效能表現
  console.log('\n⚡ 測試系統效能...');
  
  const performanceTests = [
    { name: '公告列表載入時間', endpoint: '/api/announcements' },
    { name: '單一公告載入時間', endpoint: `/api/announcements/${testAnnouncementId || 1}` },
    { name: '篩選查詢效能', endpoint: '/api/announcements?targetAudience=all&priority=medium' }
  ];

  for (const test of performanceTests) {
    const startTime = Date.now();
    const response = await makeRequest(test.endpoint);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const acceptable = responseTime < 1000; // 1秒內算可接受
    
    logResult(test.name, response.ok && acceptable, {
      responseTime: `${responseTime}ms`,
      status: response.status,
      acceptable: acceptable,
      threshold: '< 1000ms'
    });
  }

  // 輸出測試摘要
  console.log('\n📊 整合測試結果摘要:');
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
  } else {
    console.log('\n🎉 所有整合測試都通過了！');
  }

  return results;
}

// 執行測試
if (require.main === module) {
  runIntegrationTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('整合測試運行失敗:', error);
    process.exit(1);
  });
}

module.exports = { runIntegrationTests };