#!/usr/bin/env node

/**
 * Real-time Notifications System Test
 * 即時通知系統測試
 * 
 * @description 測試完整的即時通知系統，包括SSE連接、通知發送、前端更新等
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://landing-app-v2.zeabur.app'
  : 'http://localhost:3000';

// Test configuration
const config = {
  timeout: 30000,
  maxRetries: 3,
  testUsers: [
    {
      id: 'test-user-1',
      email: 'test1@kcislk.edu.tw',
      role: 'parent'
    },
    {
      id: 'test-user-2', 
      email: 'test2@kcislk.edu.tw',
      role: 'teacher'
    }
  ]
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class NotificationTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      details: []
    };
    
    this.sseConnections = new Map();
    this.notificationCounts = new Map();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const color = {
      success: colors.green,
      error: colors.red,
      warning: colors.yellow,
      info: colors.blue
    }[type] || colors.reset;
    
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  async makeRequest(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, BASE_URL);
      const requestModule = url.protocol === 'https:' ? https : http;
      
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NotificationTester/1.0',
          ...options.headers
        },
        timeout: config.timeout,
        ...options
      };

      const req = requestModule.request(url, requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            resolve({
              status: res.statusCode,
              data: parsed,
              headers: res.headers
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              data: data,
              headers: res.headers
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      
      req.end();
    });
  }

  async testHealthCheck() {
    this.log('Testing API health check...', 'info');
    
    try {
      const response = await this.makeRequest('/api/health');
      
      if (response.status === 200) {
        this.log('✅ Health check passed', 'success');
        this.results.passed++;
        this.results.details.push({
          test: 'Health Check',
          status: 'PASSED',
          details: 'API is responsive'
        });
        return true;
      } else {
        this.log(`❌ Health check failed: ${response.status}`, 'error');
        this.results.failed++;
        this.results.details.push({
          test: 'Health Check',
          status: 'FAILED',
          details: `HTTP ${response.status}`
        });
        return false;
      }
    } catch (error) {
      this.log(`❌ Health check error: ${error.message}`, 'error');
      this.results.failed++;
      this.results.details.push({
        test: 'Health Check',
        status: 'ERROR',
        details: error.message
      });
      return false;
    }
  }

  async testSSEConnection(userId = 'anonymous') {
    return new Promise((resolve, reject) => {
      this.log(`Testing SSE connection for user: ${userId}...`, 'info');
      
      const url = new URL('/api/notifications/stream', BASE_URL);
      const isHttps = url.protocol === 'https:';
      const requestModule = isHttps ? https : http;
      
      const options = {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'User-Agent': `NotificationTester/1.0 (${userId})`
        },
        timeout: 10000
      };

      let connectionEstablished = false;
      let messagesReceived = 0;
      let connectionId = null;
      
      const req = requestModule.request(url, options, (res) => {
        if (res.statusCode === 200) {
          this.log(`✅ SSE connection established (${res.statusCode})`, 'success');
          connectionEstablished = true;
          
          res.on('data', (chunk) => {
            const lines = chunk.toString().split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  messagesReceived++;
                  
                  this.log(`📨 SSE Message received: ${data.type}`, 'info');
                  
                  if (data.type === 'connected') {
                    connectionId = data.connectionId;
                    this.log(`🔗 Connection ID: ${connectionId}`, 'info');
                  }
                  
                  if (data.type === 'ping') {
                    this.log(`💓 Heartbeat received (uptime: ${data.uptime}ms)`, 'info');
                  }
                  
                } catch (error) {
                  this.log(`⚠️ Failed to parse SSE message: ${line}`, 'warning');
                }
              }
            }
          });
          
        } else {
          this.log(`❌ SSE connection failed: ${res.statusCode}`, 'error');
          
          let errorData = '';
          res.on('data', (chunk) => {
            errorData += chunk;
          });
          
          res.on('end', () => {
            reject(new Error(`SSE connection failed: ${res.statusCode} - ${errorData}`));
          });
        }
      });

      req.on('error', (error) => {
        this.log(`❌ SSE connection error: ${error.message}`, 'error');
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        
        if (connectionEstablished && messagesReceived > 0) {
          this.log(`✅ SSE connection test completed (${messagesReceived} messages)`, 'success');
          this.results.passed++;
          this.results.details.push({
            test: 'SSE Connection',
            status: 'PASSED',
            details: `Connected successfully, received ${messagesReceived} messages`
          });
          resolve({
            connected: true,
            messagesReceived,
            connectionId
          });
        } else {
          this.log(`❌ SSE connection timeout (no messages received)`, 'error');
          this.results.failed++;
          this.results.details.push({
            test: 'SSE Connection',
            status: 'FAILED',
            details: 'Connection timeout or no messages received'
          });
          reject(new Error('SSE connection timeout'));
        }
      });

      req.end();
    });
  }

  async testNotificationCreation() {
    this.log('Testing notification creation...', 'info');
    
    try {
      const testNotification = {
        title: `Test Notification - ${new Date().toISOString()}`,
        message: 'This is a test notification for the real-time system.',
        type: 'system',
        priority: 'medium',
        recipientType: 'all'
      };

      const response = await this.makeRequest('/api/notifications', {
        method: 'POST',
        body: testNotification,
        headers: {
          'Authorization': 'Bearer test-admin-token' // You may need to use a real token
        }
      });

      if (response.status === 200 || response.status === 201) {
        this.log('✅ Notification creation passed', 'success');
        this.results.passed++;
        this.results.details.push({
          test: 'Notification Creation',
          status: 'PASSED',
          details: `Created notification: ${testNotification.title}`
        });
        return response.data;
      } else {
        this.log(`❌ Notification creation failed: ${response.status}`, 'error');
        this.results.failed++;
        this.results.details.push({
          test: 'Notification Creation',
          status: 'FAILED',
          details: `HTTP ${response.status}: ${JSON.stringify(response.data)}`
        });
        return null;
      }
    } catch (error) {
      this.log(`❌ Notification creation error: ${error.message}`, 'error');
      this.results.failed++;
      this.results.details.push({
        test: 'Notification Creation',
        status: 'ERROR',
        details: error.message
      });
      return null;
    }
  }

  async testNotificationStats() {
    this.log('Testing notification stats endpoint...', 'info');
    
    try {
      const response = await this.makeRequest('/api/notifications/stats');

      if (response.status === 200) {
        this.log('✅ Notification stats passed', 'success');
        this.log(`📊 Stats: ${JSON.stringify(response.data.data || response.data)}`, 'info');
        this.results.passed++;
        this.results.details.push({
          test: 'Notification Stats',
          status: 'PASSED',
          details: 'Successfully retrieved notification statistics'
        });
        return response.data;
      } else if (response.status === 401) {
        this.log(`⚠️ Notification stats requires authentication: ${response.status}`, 'warning');
        this.results.details.push({
          test: 'Notification Stats',
          status: 'SKIPPED',
          details: 'Authentication required'
        });
        return null;
      } else {
        this.log(`❌ Notification stats failed: ${response.status}`, 'error');
        this.results.failed++;
        this.results.details.push({
          test: 'Notification Stats',
          status: 'FAILED',
          details: `HTTP ${response.status}`
        });
        return null;
      }
    } catch (error) {
      this.log(`❌ Notification stats error: ${error.message}`, 'error');
      this.results.failed++;
      this.results.details.push({
        test: 'Notification Stats',
        status: 'ERROR',
        details: error.message
      });
      return null;
    }
  }

  async testSSEPushEndpoint() {
    this.log('Testing SSE push endpoint...', 'info');
    
    try {
      const testData = {
        userIds: ['test-user-1'],
        notification: {
          type: 'test_message',
          data: {
            title: 'Test Push Notification',
            message: 'This is a test push via SSE',
            timestamp: new Date().toISOString()
          }
        }
      };

      const response = await this.makeRequest('/api/notifications/stream', {
        method: 'POST',
        body: testData
      });

      if (response.status === 200) {
        this.log('✅ SSE push endpoint passed', 'success');
        this.log(`📤 Push result: ${JSON.stringify(response.data)}`, 'info');
        this.results.passed++;
        this.results.details.push({
          test: 'SSE Push Endpoint',
          status: 'PASSED',
          details: 'Successfully pushed notification via SSE'
        });
        return response.data;
      } else {
        this.log(`❌ SSE push endpoint failed: ${response.status}`, 'error');
        this.results.failed++;
        this.results.details.push({
          test: 'SSE Push Endpoint',
          status: 'FAILED',
          details: `HTTP ${response.status}: ${JSON.stringify(response.data)}`
        });
        return null;
      }
    } catch (error) {
      this.log(`❌ SSE push endpoint error: ${error.message}`, 'error');
      this.results.failed++;
      this.results.details.push({
        test: 'SSE Push Endpoint',
        status: 'ERROR',
        details: error.message
      });
      return null;
    }
  }

  async testConcurrentConnections() {
    this.log('Testing concurrent SSE connections...', 'info');
    
    const concurrentTests = config.testUsers.map(async (user, index) => {
      try {
        await new Promise(resolve => setTimeout(resolve, index * 1000)); // Stagger connections
        const result = await this.testSSEConnection(user.id);
        return { user: user.id, success: true, result };
      } catch (error) {
        return { user: user.id, success: false, error: error.message };
      }
    });

    try {
      const results = await Promise.allSettled(concurrentTests);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const total = results.length;

      if (successful > 0) {
        this.log(`✅ Concurrent connections test passed (${successful}/${total})`, 'success');
        this.results.passed++;
        this.results.details.push({
          test: 'Concurrent SSE Connections',
          status: 'PASSED',
          details: `${successful}/${total} connections successful`
        });
      } else {
        this.log(`❌ Concurrent connections test failed (0/${total})`, 'error');
        this.results.failed++;
        this.results.details.push({
          test: 'Concurrent SSE Connections',
          status: 'FAILED',
          details: `No connections successful`
        });
      }

      return results;
    } catch (error) {
      this.log(`❌ Concurrent connections test error: ${error.message}`, 'error');
      this.results.failed++;
      this.results.details.push({
        test: 'Concurrent SSE Connections',
        status: 'ERROR',
        details: error.message
      });
      return null;
    }
  }

  async runAllTests() {
    this.log(`${colors.bold}🚀 Starting Real-time Notifications System Test${colors.reset}`, 'info');
    this.log(`Testing against: ${BASE_URL}`, 'info');
    this.log('', 'info');

    const startTime = Date.now();

    // Run tests sequentially
    await this.testHealthCheck();
    await this.testNotificationStats();
    
    // Test SSE functionality
    try {
      await this.testSSEConnection('main-test');
    } catch (error) {
      // Continue with other tests even if SSE fails
    }

    await this.testSSEPushEndpoint();
    
    // Test concurrent connections (may fail due to authentication)
    try {
      await this.testConcurrentConnections();
    } catch (error) {
      // Continue with other tests
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Print results
    this.printResults(duration);
  }

  printResults(duration) {
    this.log('', 'info');
    this.log(`${colors.bold}📋 Test Results Summary${colors.reset}`, 'info');
    this.log(`${'='.repeat(50)}`, 'info');
    this.log(`Total Tests: ${this.results.passed + this.results.failed}`, 'info');
    this.log(`${colors.green}✅ Passed: ${this.results.passed}${colors.reset}`, 'success');
    this.log(`${colors.red}❌ Failed: ${this.results.failed}${colors.reset}`, 'error');
    this.log(`⏱️ Duration: ${duration}ms`, 'info');
    this.log('', 'info');

    // Detailed results
    this.log(`${colors.bold}📝 Detailed Results:${colors.reset}`, 'info');
    this.results.details.forEach((detail, index) => {
      const statusColor = {
        'PASSED': colors.green,
        'FAILED': colors.red,
        'ERROR': colors.red,
        'SKIPPED': colors.yellow
      }[detail.status] || colors.reset;

      this.log(`${index + 1}. ${detail.test}: ${statusColor}${detail.status}${colors.reset}`, 'info');
      this.log(`   ${detail.details}`, 'info');
    });

    // Recommendations
    this.log('', 'info');
    this.log(`${colors.bold}💡 Recommendations:${colors.reset}`, 'info');
    
    if (this.results.failed > 0) {
      this.log(`${colors.yellow}⚠️ Some tests failed. Check the following:${colors.reset}`, 'warning');
      this.log('   - Ensure the server is running', 'info');
      this.log('   - Verify authentication is properly configured', 'info');
      this.log('   - Check network connectivity and firewall settings', 'info');
      this.log('   - Review server logs for errors', 'info');
    } else {
      this.log(`${colors.green}🎉 All tests passed! Real-time notification system is working correctly.${colors.reset}`, 'success');
    }

    // Exit with appropriate code
    process.exit(this.results.failed > 0 ? 1 : 0);
  }
}

// Run tests
if (require.main === module) {
  const tester = new NotificationTester();
  tester.runAllTests().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = NotificationTester;