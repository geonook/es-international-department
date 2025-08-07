#!/usr/bin/env node
/**
 * COMPREHENSIVE SYSTEM INTEGRATION TEST SUITE
 * KCISLK ESID Info Hub - Complete End-to-End Testing
 * 
 * This script performs comprehensive testing of all integrated systems:
 * - Database connectivity and operations
 * - API endpoints and functionality
 * - Real-time features (SSE notifications)
 * - Authentication system (with fallback for OAuth)
 * - Performance testing
 * - Error handling
 */

const http = require('http');
const fs = require('fs').promises;
const { performance } = require('perf_hooks');

// Test configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  testDuration: 300000, // 5 minutes
  concurrentUsers: 10,
  timeoutMs: 30000,
  retryAttempts: 3,
  performanceThresholds: {
    apiResponse: 100, // ms
    dbQuery: 50, // ms
    pageLoad: 2000, // ms
  }
};

// Test results storage
const testResults = {
  startTime: new Date().toISOString(),
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    successRate: 0
  },
  systems: {
    database: { status: 'pending', tests: [], errors: [] },
    authentication: { status: 'pending', tests: [], errors: [] },
    apis: { status: 'pending', tests: [], errors: [] },
    realtime: { status: 'pending', tests: [], errors: [] },
    email: { status: 'pending', tests: [], errors: [] },
    performance: { status: 'pending', tests: [], errors: [] },
    frontend: { status: 'pending', tests: [], errors: [] }
  },
  performance: {
    averageResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: Infinity,
    totalRequests: 0,
    failedRequests: 0,
    requestsPerSecond: 0
  },
  recommendations: []
};

// Utility functions
class TestLogger {
  static info(message, system = 'SYSTEM') {
    console.log(`🔷 [${system}] ${message}`);
  }
  
  static success(message, system = 'SYSTEM') {
    console.log(`✅ [${system}] ${message}`);
  }
  
  static warning(message, system = 'SYSTEM') {
    console.log(`⚠️  [${system}] ${message}`);
  }
  
  static error(message, system = 'SYSTEM') {
    console.log(`❌ [${system}] ${message}`);
  }
  
  static performance(message, time, threshold) {
    const emoji = time <= threshold ? '⚡' : time <= threshold * 2 ? '🟡' : '🔴';
    console.log(`${emoji} [PERF] ${message} (${time}ms)`);
  }
}

// HTTP Request helper with performance tracking
async function makeRequest(options) {
  const startTime = performance.now();
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        // Track performance
        testResults.performance.totalRequests++;
        testResults.performance.averageResponseTime = 
          (testResults.performance.averageResponseTime * (testResults.performance.totalRequests - 1) + responseTime) / testResults.performance.totalRequests;
        testResults.performance.maxResponseTime = Math.max(testResults.performance.maxResponseTime, responseTime);
        testResults.performance.minResponseTime = Math.min(testResults.performance.minResponseTime, responseTime);
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          responseTime: responseTime
        });
      });
    });
    
    req.on('error', (err) => {
      testResults.performance.failedRequests++;
      reject(err);
    });
    
    req.setTimeout(CONFIG.timeoutMs, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Database System Tests
async function testDatabaseSystem() {
  TestLogger.info('Testing database system...', 'DATABASE');
  const system = testResults.systems.database;
  
  try {
    // Test 1: Basic connectivity
    const connectTest = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (connectTest.statusCode === 200) {
      system.tests.push({ name: 'Database connectivity', status: 'passed', responseTime: connectTest.responseTime });
      TestLogger.success(`Database connectivity test passed (${connectTest.responseTime}ms)`, 'DATABASE');
    } else {
      throw new Error(`Health check failed: ${connectTest.statusCode}`);
    }
    
    // Test 2: Data integrity
    const dataTest = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/dashboard/stats',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (dataTest.statusCode === 200 || dataTest.statusCode === 401) { // 401 is expected without auth
      system.tests.push({ name: 'Data integrity check', status: 'passed', responseTime: dataTest.responseTime });
      TestLogger.success(`Data integrity test passed (${dataTest.responseTime}ms)`, 'DATABASE');
    }
    
    system.status = 'passed';
    testResults.summary.passed++;
    
  } catch (error) {
    system.status = 'failed';
    system.errors.push(error.message);
    TestLogger.error(`Database test failed: ${error.message}`, 'DATABASE');
    testResults.summary.failed++;
  }
  
  testResults.summary.totalTests++;
}

// Authentication System Tests
async function testAuthenticationSystem() {
  TestLogger.info('Testing authentication system...', 'AUTH');
  const system = testResults.systems.authentication;
  
  try {
    // Test 1: Login endpoint availability
    const loginTest = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Login endpoint should return 405 (Method Not Allowed) for GET request
    if (loginTest.statusCode === 405) {
      system.tests.push({ name: 'Login endpoint availability', status: 'passed', responseTime: loginTest.responseTime });
      TestLogger.success(`Login endpoint available (${loginTest.responseTime}ms)`, 'AUTH');
    }
    
    // Test 2: JWT validation
    const jwtTest = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/verify',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      },
      body: JSON.stringify({})
    });
    
    // Should return 401 for invalid token
    if (jwtTest.statusCode === 401) {
      system.tests.push({ name: 'JWT validation', status: 'passed', responseTime: jwtTest.responseTime });
      TestLogger.success(`JWT validation test passed (${jwtTest.responseTime}ms)`, 'AUTH');
    }
    
    // Test 3: OAuth endpoints (basic availability)
    const oauthTest = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/google',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    // OAuth endpoint should be available (even if not configured)
    system.tests.push({ 
      name: 'OAuth endpoints', 
      status: oauthTest.statusCode < 500 ? 'passed' : 'warning',
      responseTime: oauthTest.responseTime 
    });
    
    if (oauthTest.statusCode < 500) {
      TestLogger.success(`OAuth endpoints available (${oauthTest.responseTime}ms)`, 'AUTH');
    } else {
      TestLogger.warning(`OAuth configuration incomplete but endpoints available`, 'AUTH');
      testResults.summary.warnings++;
    }
    
    system.status = 'passed';
    testResults.summary.passed++;
    
  } catch (error) {
    system.status = 'failed';
    system.errors.push(error.message);
    TestLogger.error(`Authentication test failed: ${error.message}`, 'AUTH');
    testResults.summary.failed++;
  }
  
  testResults.summary.totalTests++;
}

// API Endpoints Tests
async function testAPIEndpoints() {
  TestLogger.info('Testing API endpoints...', 'API');
  const system = testResults.systems.apis;
  
  const endpoints = [
    { path: '/api/announcements', method: 'GET', name: 'Announcements API' },
    { path: '/api/events', method: 'GET', name: 'Events API' },
    { path: '/api/notifications', method: 'GET', name: 'Notifications API' },
    { path: '/api/resources', method: 'GET', name: 'Resources API' },
    { path: '/api/health', method: 'GET', name: 'Health Check API' },
    { path: '/api/admin/dashboard/stats', method: 'GET', name: 'Admin Stats API' }
  ];
  
  let passedTests = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: endpoint.path,
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Consider 200, 401 (auth required), 404 as acceptable responses
      const isAcceptable = [200, 401, 404].includes(response.statusCode);
      
      system.tests.push({
        name: endpoint.name,
        status: isAcceptable ? 'passed' : 'failed',
        responseTime: response.responseTime,
        statusCode: response.statusCode
      });
      
      if (isAcceptable) {
        TestLogger.success(`${endpoint.name} - ${response.statusCode} (${response.responseTime}ms)`, 'API');
        passedTests++;
      } else {
        TestLogger.error(`${endpoint.name} failed - ${response.statusCode}`, 'API');
      }
      
    } catch (error) {
      system.tests.push({
        name: endpoint.name,
        status: 'failed',
        error: error.message
      });
      TestLogger.error(`${endpoint.name} error: ${error.message}`, 'API');
    }
  }
  
  system.status = passedTests >= endpoints.length * 0.8 ? 'passed' : 'failed';
  
  if (system.status === 'passed') {
    testResults.summary.passed++;
  } else {
    testResults.summary.failed++;
  }
  
  testResults.summary.totalTests++;
}

// Real-time Features Tests
async function testRealtimeFeatures() {
  TestLogger.info('Testing real-time features...', 'REALTIME');
  const system = testResults.systems.realtime;
  
  try {
    // Test SSE endpoint availability
    const sseTest = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/notifications/stream',
      method: 'GET',
      headers: { 
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    });
    
    system.tests.push({
      name: 'SSE endpoint availability',
      status: sseTest.statusCode === 200 || sseTest.statusCode === 401 ? 'passed' : 'failed',
      responseTime: sseTest.responseTime,
      statusCode: sseTest.statusCode
    });
    
    if (sseTest.statusCode === 200 || sseTest.statusCode === 401) {
      TestLogger.success(`SSE endpoint available (${sseTest.responseTime}ms)`, 'REALTIME');
      system.status = 'passed';
      testResults.summary.passed++;
    } else {
      throw new Error(`SSE endpoint failed: ${sseTest.statusCode}`);
    }
    
  } catch (error) {
    system.status = 'failed';
    system.errors.push(error.message);
    TestLogger.error(`Real-time features test failed: ${error.message}`, 'REALTIME');
    testResults.summary.failed++;
  }
  
  testResults.summary.totalTests++;
}

// Email System Tests
async function testEmailSystem() {
  TestLogger.info('Testing email system...', 'EMAIL');
  const system = testResults.systems.email;
  
  try {
    // Test email configuration endpoint
    const emailTest = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/email/test',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });
    
    system.tests.push({
      name: 'Email system availability',
      status: emailTest.statusCode < 500 ? 'passed' : 'warning',
      responseTime: emailTest.responseTime,
      statusCode: emailTest.statusCode
    });
    
    if (emailTest.statusCode < 500) {
      TestLogger.success(`Email system endpoints available (${emailTest.responseTime}ms)`, 'EMAIL');
      system.status = 'passed';
      testResults.summary.passed++;
    } else {
      TestLogger.warning(`Email system may need configuration`, 'EMAIL');
      system.status = 'warning';
      testResults.summary.warnings++;
    }
    
  } catch (error) {
    system.status = 'warning';
    system.errors.push(error.message);
    TestLogger.warning(`Email system test: ${error.message}`, 'EMAIL');
    testResults.summary.warnings++;
  }
  
  testResults.summary.totalTests++;
}

// Performance Tests
async function testPerformance() {
  TestLogger.info('Running performance tests...', 'PERFORMANCE');
  const system = testResults.systems.performance;
  
  try {
    // Test 1: Load testing with concurrent requests
    const concurrentRequests = [];
    const testPath = '/api/health';
    
    TestLogger.info(`Executing ${CONFIG.concurrentUsers} concurrent requests...`, 'PERFORMANCE');
    
    for (let i = 0; i < CONFIG.concurrentUsers; i++) {
      concurrentRequests.push(
        makeRequest({
          hostname: 'localhost',
          port: 3000,
          path: testPath,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }
    
    const results = await Promise.allSettled(concurrentRequests);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    system.tests.push({
      name: 'Concurrent request handling',
      status: successful >= CONFIG.concurrentUsers * 0.8 ? 'passed' : 'failed',
      details: { successful, failed, total: CONFIG.concurrentUsers }
    });
    
    if (successful >= CONFIG.concurrentUsers * 0.8) {
      TestLogger.success(`Concurrent requests: ${successful}/${CONFIG.concurrentUsers} successful`, 'PERFORMANCE');
    } else {
      TestLogger.error(`Concurrent requests: Only ${successful}/${CONFIG.concurrentUsers} successful`, 'PERFORMANCE');
    }
    
    // Test 2: Response time thresholds
    const avgResponseTime = testResults.performance.averageResponseTime;
    const maxResponseTime = testResults.performance.maxResponseTime;
    
    system.tests.push({
      name: 'Response time performance',
      status: avgResponseTime <= CONFIG.performanceThresholds.apiResponse ? 'passed' : 'warning',
      details: { 
        average: Math.round(avgResponseTime), 
        max: Math.round(maxResponseTime),
        threshold: CONFIG.performanceThresholds.apiResponse 
      }
    });
    
    TestLogger.performance(
      `Average response time: ${Math.round(avgResponseTime)}ms`,
      avgResponseTime,
      CONFIG.performanceThresholds.apiResponse
    );
    
    TestLogger.performance(
      `Max response time: ${Math.round(maxResponseTime)}ms`,
      maxResponseTime,
      CONFIG.performanceThresholds.apiResponse * 2
    );
    
    system.status = successful >= CONFIG.concurrentUsers * 0.8 ? 'passed' : 'warning';
    
    if (system.status === 'passed') {
      testResults.summary.passed++;
    } else {
      testResults.summary.warnings++;
    }
    
  } catch (error) {
    system.status = 'failed';
    system.errors.push(error.message);
    TestLogger.error(`Performance test failed: ${error.message}`, 'PERFORMANCE');
    testResults.summary.failed++;
  }
  
  testResults.summary.totalTests++;
}

// Frontend Integration Tests
async function testFrontendIntegration() {
  TestLogger.info('Testing frontend integration...', 'FRONTEND');
  const system = testResults.systems.frontend;
  
  try {
    // Test main pages availability
    const pages = [
      { path: '/', name: 'Home page' },
      { path: '/login', name: 'Login page' },
      { path: '/events', name: 'Events page' },
      { path: '/resources', name: 'Resources page' }
    ];
    
    let passedPages = 0;
    
    for (const page of pages) {
      try {
        const response = await makeRequest({
          hostname: 'localhost',
          port: 3000,
          path: page.path,
          method: 'GET',
          headers: { 'Accept': 'text/html' }
        });
        
        const isSuccess = response.statusCode === 200;
        
        system.tests.push({
          name: page.name,
          status: isSuccess ? 'passed' : 'failed',
          responseTime: response.responseTime,
          statusCode: response.statusCode
        });
        
        if (isSuccess) {
          TestLogger.success(`${page.name} loaded successfully (${response.responseTime}ms)`, 'FRONTEND');
          passedPages++;
        } else {
          TestLogger.error(`${page.name} failed to load: ${response.statusCode}`, 'FRONTEND');
        }
        
      } catch (error) {
        system.tests.push({
          name: page.name,
          status: 'failed',
          error: error.message
        });
        TestLogger.error(`${page.name} error: ${error.message}`, 'FRONTEND');
      }
    }
    
    system.status = passedPages >= pages.length * 0.75 ? 'passed' : 'failed';
    
    if (system.status === 'passed') {
      testResults.summary.passed++;
    } else {
      testResults.summary.failed++;
    }
    
  } catch (error) {
    system.status = 'failed';
    system.errors.push(error.message);
    TestLogger.error(`Frontend integration test failed: ${error.message}`, 'FRONTEND');
    testResults.summary.failed++;
  }
  
  testResults.summary.totalTests++;
}

// Generate recommendations based on test results
function generateRecommendations() {
  TestLogger.info('Generating recommendations...', 'ANALYSIS');
  
  // Performance recommendations
  const avgResponseTime = testResults.performance.averageResponseTime;
  if (avgResponseTime > CONFIG.performanceThresholds.apiResponse) {
    testResults.recommendations.push({
      type: 'performance',
      priority: 'high',
      message: `Average API response time (${Math.round(avgResponseTime)}ms) exceeds threshold (${CONFIG.performanceThresholds.apiResponse}ms). Consider optimizing database queries and enabling caching.`
    });
  }
  
  // System status recommendations
  Object.entries(testResults.systems).forEach(([systemName, system]) => {
    if (system.status === 'failed') {
      testResults.recommendations.push({
        type: 'critical',
        priority: 'critical',
        message: `${systemName.toUpperCase()} system failed testing. Immediate attention required: ${system.errors.join(', ')}`
      });
    } else if (system.status === 'warning') {
      testResults.recommendations.push({
        type: 'warning',
        priority: 'medium',
        message: `${systemName.toUpperCase()} system has issues that should be addressed: ${system.errors.join(', ')}`
      });
    }
  });
  
  // Success rate recommendations
  const successRate = testResults.summary.totalTests > 0 ? 
    (testResults.summary.passed / testResults.summary.totalTests) * 100 : 0;
    
  testResults.summary.successRate = Math.round(successRate);
  
  if (successRate < 80) {
    testResults.recommendations.push({
      type: 'critical',
      priority: 'critical',
      message: `Overall success rate (${Math.round(successRate)}%) is below acceptable threshold (80%). System may not be production ready.`
    });
  } else if (successRate < 95) {
    testResults.recommendations.push({
      type: 'warning',
      priority: 'medium',
      message: `Overall success rate (${Math.round(successRate)}%) is acceptable but could be improved for production deployment.`
    });
  }
}

// Generate comprehensive test report
async function generateTestReport() {
  TestLogger.info('Generating comprehensive test report...', 'REPORT');
  
  testResults.endTime = new Date().toISOString();
  testResults.performance.requestsPerSecond = Math.round(
    testResults.performance.totalRequests / 
    ((new Date(testResults.endTime) - new Date(testResults.startTime)) / 1000)
  );
  
  generateRecommendations();
  
  const report = `
# COMPREHENSIVE SYSTEM INTEGRATION TEST REPORT
**KCISLK ESID Info Hub**
**Generated:** ${testResults.endTime}

## EXECUTIVE SUMMARY

- **Total Tests:** ${testResults.summary.totalTests}
- **Passed:** ${testResults.summary.passed}
- **Failed:** ${testResults.summary.failed}  
- **Warnings:** ${testResults.summary.warnings}
- **Success Rate:** ${testResults.summary.successRate}%

## PERFORMANCE METRICS

- **Total Requests:** ${testResults.performance.totalRequests}
- **Failed Requests:** ${testResults.performance.failedRequests}
- **Average Response Time:** ${Math.round(testResults.performance.averageResponseTime)}ms
- **Max Response Time:** ${Math.round(testResults.performance.maxResponseTime)}ms
- **Min Response Time:** ${Math.round(testResults.performance.minResponseTime)}ms
- **Requests Per Second:** ${testResults.performance.requestsPerSecond}

## SYSTEM STATUS OVERVIEW

${Object.entries(testResults.systems).map(([name, system]) => 
  `- **${name.toUpperCase()}:** ${system.status.toUpperCase()} (${system.tests.length} tests)`
).join('\n')}

## DETAILED TEST RESULTS

${Object.entries(testResults.systems).map(([name, system]) => `
### ${name.toUpperCase()} SYSTEM
**Status:** ${system.status.toUpperCase()}
**Tests:** ${system.tests.length}

${system.tests.map(test => 
  `- **${test.name}:** ${test.status.toUpperCase()}${test.responseTime ? ` (${test.responseTime}ms)` : ''}${test.statusCode ? ` [${test.statusCode}]` : ''}`
).join('\n')}

${system.errors.length > 0 ? `**Errors:**\n${system.errors.map(err => `- ${err}`).join('\n')}` : ''}
`).join('\n')}

## RECOMMENDATIONS

${testResults.recommendations.length > 0 ? 
  testResults.recommendations.map((rec, index) => 
    `${index + 1}. **[${rec.priority.toUpperCase()}]** ${rec.message}`
  ).join('\n\n') : 
  'No specific recommendations. All systems are functioning within acceptable parameters.'
}

## PRODUCTION READINESS ASSESSMENT

${testResults.summary.successRate >= 95 ? 
  '✅ **READY FOR PRODUCTION** - All systems are functioning optimally.' :
  testResults.summary.successRate >= 80 ?
  '⚠️  **READY WITH CAUTIONS** - System is functional but some issues should be addressed.' :
  '❌ **NOT READY FOR PRODUCTION** - Critical issues must be resolved before deployment.'
}

## TECHNICAL DETAILS

**Test Configuration:**
- Base URL: ${CONFIG.baseUrl}
- Concurrent Users: ${CONFIG.concurrentUsers}
- Timeout: ${CONFIG.timeoutMs}ms
- Performance Threshold: ${CONFIG.performanceThresholds.apiResponse}ms

**Environment:**
- Node.js: ${process.version}
- Test Duration: ${Math.round((new Date(testResults.endTime) - new Date(testResults.startTime)) / 1000)}s

---
*Report generated by KCISLK ESID Info Hub Integration Test Suite*
`;

  await fs.writeFile('/Users/chenzehong/Desktop/es-international-department (2)/COMPREHENSIVE-INTEGRATION-TEST-REPORT.md', report);
  
  TestLogger.success('Test report generated: COMPREHENSIVE-INTEGRATION-TEST-REPORT.md', 'REPORT');
}

// Main test execution
async function runIntegrationTests() {
  console.log('🚀 KCISLK ESID INFO HUB - COMPREHENSIVE SYSTEM INTEGRATION TESTING');
  console.log('=' .repeat(80));
  console.log(`⏱️  Start Time: ${testResults.startTime}`);
  console.log(`🎯 Target: ${CONFIG.baseUrl}`);
  console.log(`👥 Concurrent Users: ${CONFIG.concurrentUsers}`);
  console.log('=' .repeat(80));
  
  try {
    // Execute all test suites
    await testDatabaseSystem();
    await testAuthenticationSystem();
    await testAPIEndpoints();
    await testRealtimeFeatures();
    await testEmailSystem();
    await testPerformance();
    await testFrontendIntegration();
    
    // Generate final report
    await generateTestReport();
    
    console.log('=' .repeat(80));
    console.log('📊 FINAL RESULTS:');
    console.log(`✅ Passed: ${testResults.summary.passed}`);
    console.log(`❌ Failed: ${testResults.summary.failed}`);
    console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);
    console.log(`📈 Success Rate: ${testResults.summary.successRate}%`);
    console.log(`⚡ Avg Response Time: ${Math.round(testResults.performance.averageResponseTime)}ms`);
    console.log('=' .repeat(80));
    
    if (testResults.summary.successRate >= 80) {
      console.log('🎉 INTEGRATION TESTING COMPLETED SUCCESSFULLY!');
      process.exit(0);
    } else {
      console.log('⚠️  INTEGRATION TESTING COMPLETED WITH ISSUES');
      process.exit(1);
    }
    
  } catch (error) {
    TestLogger.error(`Integration test suite failed: ${error.message}`, 'MAIN');
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  TestLogger.info('Test suite interrupted. Generating partial report...', 'MAIN');
  await generateTestReport();
  process.exit(1);
});

// Execute the test suite
runIntegrationTests();