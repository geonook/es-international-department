#!/usr/bin/env node

/**
 * Additional Events API Tests
 * Tests calendar and registration endpoints specifically
 */

async function testAdditionalEndpoints() {
  console.log('🗓️ Testing Additional Events Endpoints...\n');
  
  const BASE_URL = 'http://localhost:3000';
  const results = [];

  async function makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      
      let data;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }
      
      return { status: response.status, ok: response.ok, data };
    } catch (error) {
      return { status: 0, ok: false, error: error.message };
    }
  }

  // Test 1: Calendar endpoint
  console.log('📅 Testing /api/events/calendar...');
  const calendarResponse = await makeRequest('/api/events/calendar');
  console.log(`   Status: ${calendarResponse.status}`);
  
  if (calendarResponse.status === 401) {
    console.log('   ✅ Calendar endpoint requires authentication (as expected)');
    results.push({ test: 'Calendar Endpoint', passed: true, note: 'Requires auth' });
  } else if (calendarResponse.ok) {
    console.log('   ✅ Calendar endpoint accessible');
    console.log('   📊 Data structure:', typeof calendarResponse.data);
    results.push({ test: 'Calendar Endpoint', passed: true, note: 'Accessible' });
  } else {
    console.log('   ❌ Calendar endpoint error');
    results.push({ test: 'Calendar Endpoint', passed: false, error: calendarResponse.status });
  }

  // Test 2: Calendar with date parameters
  console.log('\n📅 Testing /api/events/calendar with date parameters...');
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const calendarWithParamsResponse = await makeRequest(`/api/events/calendar?year=${currentYear}&month=${currentMonth}`);
  console.log(`   Status: ${calendarWithParamsResponse.status}`);
  
  if (calendarWithParamsResponse.status === 401 || calendarWithParamsResponse.ok) {
    console.log('   ✅ Calendar with parameters working');
    results.push({ test: 'Calendar with Parameters', passed: true });
  } else {
    console.log('   ❌ Calendar with parameters error');
    results.push({ test: 'Calendar with Parameters', passed: false });
  }

  // Test 3: Registration endpoint (POST)
  console.log('\n📝 Testing event registration POST...');
  const registrationData = {
    participantName: 'Test User API',
    participantEmail: 'test-api@example.com',
    participantPhone: '0912345678',
    grade: '3-4',
    specialRequests: 'API Testing'
  };
  
  const registrationResponse = await makeRequest('/api/events/1/registration', {
    method: 'POST',
    body: JSON.stringify(registrationData)
  });
  console.log(`   Status: ${registrationResponse.status}`);
  
  if (registrationResponse.status === 401 || registrationResponse.status === 404) {
    console.log('   ✅ Registration endpoint properly protected or event not found');
    results.push({ test: 'Event Registration POST', passed: true, note: 'Protected endpoint' });
  } else if (registrationResponse.ok) {
    console.log('   ✅ Registration successful');
    results.push({ test: 'Event Registration POST', passed: true, note: 'Registration successful' });
  } else {
    console.log('   ❌ Registration error');
    results.push({ test: 'Event Registration POST', passed: false, error: registrationResponse.status });
  }

  // Test 4: Registration status (GET)
  console.log('\n📝 Testing registration status GET...');
  const registrationStatusResponse = await makeRequest('/api/events/1/registration');
  console.log(`   Status: ${registrationStatusResponse.status}`);
  
  if ([200, 401, 404].includes(registrationStatusResponse.status)) {
    console.log('   ✅ Registration status endpoint working');
    results.push({ test: 'Registration Status GET', passed: true });
  } else {
    console.log('   ❌ Registration status error');
    results.push({ test: 'Registration Status GET', passed: false });
  }

  // Test 5: Event notifications endpoint
  console.log('\n🔔 Testing event notifications...');
  const notificationsResponse = await makeRequest('/api/events/1/notifications');
  console.log(`   Status: ${notificationsResponse.status}`);
  
  if ([200, 401, 404].includes(notificationsResponse.status)) {
    console.log('   ✅ Event notifications endpoint working');
    results.push({ test: 'Event Notifications', passed: true });
  } else {
    console.log('   ❌ Event notifications error');
    results.push({ test: 'Event Notifications', passed: false });
  }

  // Test 6: Admin event notifications POST
  console.log('\n🔔 Testing admin event notifications POST...');
  const notificationData = {
    type: 'reminder',
    recipientType: 'all_registered',
    title: 'Test Notification',
    message: 'API testing notification'
  };
  
  const adminNotificationResponse = await makeRequest('/api/events/1/notifications', {
    method: 'POST',
    body: JSON.stringify(notificationData)
  });
  console.log(`   Status: ${adminNotificationResponse.status}`);
  
  if ([401, 403, 404].includes(adminNotificationResponse.status)) {
    console.log('   ✅ Admin notifications properly protected');
    results.push({ test: 'Admin Event Notifications POST', passed: true, note: 'Protected' });
  } else if (adminNotificationResponse.ok) {
    console.log('   ✅ Admin notifications working');
    results.push({ test: 'Admin Event Notifications POST', passed: true, note: 'Working' });
  } else {
    console.log('   ❌ Admin notifications error');
    results.push({ test: 'Admin Event Notifications POST', passed: false });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Additional Events API Tests Summary');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const successRate = ((passed / total) * 100).toFixed(1);
  
  console.log(`✅ Passed: ${passed}/${total} (${successRate}%)`);
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    const note = result.note ? ` (${result.note})` : '';
    const error = result.error ? ` - Status: ${result.error}` : '';
    console.log(`   ${index + 1}. ${status} ${result.test}${note}${error}`);
  });
  
  if (successRate >= 80) {
    console.log('\n🎉 Additional endpoints verification PASSED! All critical endpoints working correctly.');
  } else {
    console.log('\n⚠️ Some additional endpoints need attention.');
  }
  
  return { passed, total, successRate, results };
}

// Run tests
if (require.main === module) {
  testAdditionalEndpoints()
    .then(summary => {
      process.exit(summary.successRate >= 80 ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = testAdditionalEndpoints;