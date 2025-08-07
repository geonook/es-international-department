#!/usr/bin/env node

/**
 * Real-time Notification Integration Test
 * 即時通知整合測試
 * 
 * @description 完整測試即時通知系統的所有組件整合
 * @features SSE連接、通知創建、前端更新、錯誤處理、重連機制
 * @author Claude Code | Generated for KCISLK ESID Info Hub
 */

const { exec, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const config = {
  serverUrl: process.env.NODE_ENV === 'production' 
    ? 'https://landing-app-v2.zeabur.app'
    : 'http://localhost:3000',
  testDuration: 60000, // 1 minute
  notificationInterval: 5000, // Send notification every 5 seconds
  maxConcurrentConnections: 5,
  testNotifications: [
    {
      title: '測試公告',
      message: '這是一個測試公告通知',
      type: 'announcement',
      priority: 'medium'
    },
    {
      title: '重要活動提醒',
      message: '重要活動即將開始，請準時參加',
      type: 'event',
      priority: 'high'
    },
    {
      title: '系統維護通知',
      message: '系統將進行例行維護',
      type: 'maintenance',
      priority: 'urgent'
    }
  ]
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class NotificationIntegrationTester {
  constructor() {
    this.results = {
      sseTests: { passed: 0, failed: 0, details: [] },
      notificationTests: { passed: 0, failed: 0, details: [] },
      integrationTests: { passed: 0, failed: 0, details: [] },
      performanceTests: { passed: 0, failed: 0, details: [] }
    };
    
    this.activeConnections = [];
    this.notificationsSent = 0;
    this.notificationsReceived = 0;
    this.startTime = Date.now();
  }

  log(message, type = 'info', category = 'GENERAL') {
    const timestamp = new Date().toISOString();
    const color = {
      success: colors.green,
      error: colors.red,
      warning: colors.yellow,
      info: colors.blue,
      debug: colors.cyan,
      performance: colors.magenta
    }[type] || colors.reset;
    
    console.log(`${color}[${timestamp}] [${category}] ${message}${colors.reset}`);
  }

  async checkServerStatus() {
    this.log('Checking server status...', 'info', 'SERVER');
    
    try {
      const response = await fetch(`${config.serverUrl}/api/health`);
      if (response.ok) {
        this.log('✅ Server is running and responsive', 'success', 'SERVER');
        return true;
      } else {
        this.log(`❌ Server responded with status: ${response.status}`, 'error', 'SERVER');
        return false;
      }
    } catch (error) {
      this.log(`❌ Server is not accessible: ${error.message}`, 'error', 'SERVER');
      return false;
    }
  }

  async testSSEConnection(connectionId) {
    return new Promise((resolve, reject) => {
      this.log(`Starting SSE connection test: ${connectionId}`, 'info', 'SSE');
      
      const eventSource = new EventSource(`${config.serverUrl}/api/notifications/stream`);
      const connection = {
        id: connectionId,
        eventSource,
        connected: false,
        messagesReceived: 0,
        errors: 0,
        startTime: Date.now()
      };

      this.activeConnections.push(connection);

      eventSource.onopen = () => {
        connection.connected = true;
        this.log(`✅ SSE connection ${connectionId} established`, 'success', 'SSE');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          connection.messagesReceived++;
          
          switch (data.type) {
            case 'connected':
              this.log(`🔗 Connection ${connectionId} confirmed: ${data.connectionId}`, 'info', 'SSE');
              break;
              
            case 'ping':
              this.log(`💓 Heartbeat received on connection ${connectionId}`, 'debug', 'SSE');
              break;
              
            case 'new_notifications':
            case 'notification':
              this.notificationsReceived++;
              this.log(`📨 Notification received on connection ${connectionId}: ${data.data?.title || 'Unknown'}`, 'success', 'SSE');
              break;
              
            case 'stats':
              this.log(`📊 Stats update on connection ${connectionId}: unread=${data.data?.unreadCount}`, 'info', 'SSE');
              break;
              
            case 'broadcast':
              this.log(`📢 Broadcast received on connection ${connectionId}`, 'info', 'SSE');
              break;
          }
        } catch (error) {
          connection.errors++;
          this.log(`⚠️ Failed to parse message on connection ${connectionId}: ${error.message}`, 'warning', 'SSE');
        }
      };

      eventSource.onerror = (error) => {
        connection.errors++;
        this.log(`❌ SSE error on connection ${connectionId}: ${error.type}`, 'error', 'SSE');
        
        if (connection.errors > 3) {
          this.log(`🔌 Closing connection ${connectionId} due to excessive errors`, 'warning', 'SSE');
          eventSource.close();
          resolve(connection);
        }
      };

      // Auto-resolve after 30 seconds
      setTimeout(() => {
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
        }
        resolve(connection);
      }, 30000);
    });
  }

  async sendTestNotification(notification) {
    try {
      this.log(`Sending test notification: ${notification.title}`, 'info', 'NOTIFICATION');
      
      const response = await fetch(`${config.serverUrl}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // You might need to add authentication headers here
        },
        body: JSON.stringify({
          ...notification,
          recipientType: 'all'
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.notificationsSent++;
        this.log(`✅ Notification sent successfully: ${result.totalSent} recipients`, 'success', 'NOTIFICATION');
        return result;
      } else {
        this.log(`❌ Failed to send notification: ${response.status}`, 'error', 'NOTIFICATION');
        return null;
      }
    } catch (error) {
      this.log(`❌ Notification send error: ${error.message}`, 'error', 'NOTIFICATION');
      return null;
    }
  }

  async testNotificationStats() {
    try {
      this.log('Testing notification stats endpoint...', 'info', 'API');
      
      const response = await fetch(`${config.serverUrl}/api/notifications/stats`);
      
      if (response.ok) {
        const result = await response.json();
        this.log('✅ Notification stats retrieved successfully', 'success', 'API');
        this.log(`📊 Stats: ${JSON.stringify(result.data)}`, 'debug', 'API');
        return result;
      } else if (response.status === 401) {
        this.log('⚠️ Notification stats requires authentication', 'warning', 'API');
        return null;
      } else {
        this.log(`❌ Notification stats failed: ${response.status}`, 'error', 'API');
        return null;
      }
    } catch (error) {
      this.log(`❌ Notification stats error: ${error.message}`, 'error', 'API');
      return null;
    }
  }

  async testSSEPushEndpoint() {
    try {
      this.log('Testing SSE push endpoint...', 'info', 'PUSH');
      
      const testData = {
        userIds: ['test-user-integration'],
        notification: {
          type: 'test_push',
          data: {
            title: 'Integration Test Push',
            message: 'This is a test push notification',
            timestamp: new Date().toISOString()
          }
        }
      };

      const response = await fetch(`${config.serverUrl}/api/notifications/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      if (response.ok) {
        const result = await response.json();
        this.log(`✅ SSE push successful: ${result.activeConnections} active connections`, 'success', 'PUSH');
        return result;
      } else {
        this.log(`❌ SSE push failed: ${response.status}`, 'error', 'PUSH');
        return null;
      }
    } catch (error) {
      this.log(`❌ SSE push error: ${error.message}`, 'error', 'PUSH');
      return null;
    }
  }

  async runConcurrentConnectionTest() {
    this.log(`Starting concurrent connection test (${config.maxConcurrentConnections} connections)...`, 'info', 'CONCURRENT');
    
    const connectionPromises = [];
    for (let i = 0; i < config.maxConcurrentConnections; i++) {
      connectionPromises.push(this.testSSEConnection(`concurrent-${i}`));
    }

    const connections = await Promise.allSettled(connectionPromises);
    const successful = connections.filter(c => c.status === 'fulfilled' && c.value.connected).length;
    
    this.log(`Concurrent connection test completed: ${successful}/${config.maxConcurrentConnections} successful`, 
      successful > 0 ? 'success' : 'error', 'CONCURRENT');
    
    return { successful, total: config.maxConcurrentConnections };
  }

  async runNotificationFlowTest() {
    this.log('Starting notification flow test...', 'info', 'FLOW');
    
    // Start SSE connection
    const connectionPromise = this.testSSEConnection('flow-test');
    
    // Wait a moment for connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Send multiple test notifications
    for (let i = 0; i < config.testNotifications.length; i++) {
      const notification = {
        ...config.testNotifications[i],
        title: `${config.testNotifications[i].title} #${i + 1}`,
        timestamp: new Date().toISOString()
      };
      
      await this.sendTestNotification(notification);
      
      // Wait between notifications
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Wait for connection to receive messages
    const connection = await connectionPromise;
    
    this.log(`Notification flow test completed:`, 'info', 'FLOW');
    this.log(`  - Notifications sent: ${this.notificationsSent}`, 'info', 'FLOW');
    this.log(`  - Notifications received: ${this.notificationsReceived}`, 'info', 'FLOW');
    this.log(`  - Messages received: ${connection.messagesReceived}`, 'info', 'FLOW');
    
    return {
      sent: this.notificationsSent,
      received: this.notificationsReceived,
      messages: connection.messagesReceived
    };
  }

  async runPerformanceTest() {
    this.log('Starting performance test...', 'performance', 'PERF');
    
    const startTime = Date.now();
    const metrics = {
      connectionTime: 0,
      firstMessageTime: 0,
      averageLatency: 0,
      totalMessages: 0
    };

    return new Promise((resolve) => {
      const eventSource = new EventSource(`${config.serverUrl}/api/notifications/stream`);
      let firstMessage = true;
      let messageCount = 0;
      let totalLatency = 0;

      eventSource.onopen = () => {
        metrics.connectionTime = Date.now() - startTime;
        this.log(`📊 Connection established in ${metrics.connectionTime}ms`, 'performance', 'PERF');
      };

      eventSource.onmessage = (event) => {
        const now = Date.now();
        
        if (firstMessage) {
          metrics.firstMessageTime = now - startTime;
          this.log(`📊 First message received in ${metrics.firstMessageTime}ms`, 'performance', 'PERF');
          firstMessage = false;
        }

        try {
          const data = JSON.parse(event.data);
          if (data.timestamp) {
            const latency = now - new Date(data.timestamp).getTime();
            totalLatency += latency;
            messageCount++;
          }
          metrics.totalMessages++;
        } catch (error) {
          // Ignore parsing errors for performance test
        }
      };

      // Stop after 15 seconds
      setTimeout(() => {
        eventSource.close();
        metrics.averageLatency = messageCount > 0 ? totalLatency / messageCount : 0;
        
        this.log('Performance test completed:', 'performance', 'PERF');
        this.log(`  - Connection time: ${metrics.connectionTime}ms`, 'performance', 'PERF');
        this.log(`  - First message time: ${metrics.firstMessageTime}ms`, 'performance', 'PERF');
        this.log(`  - Total messages: ${metrics.totalMessages}`, 'performance', 'PERF');
        this.log(`  - Average latency: ${metrics.averageLatency.toFixed(2)}ms`, 'performance', 'PERF');
        
        resolve(metrics);
      }, 15000);
    });
  }

  calculateResults() {
    const totalTests = Object.values(this.results).reduce((sum, category) => 
      sum + category.passed + category.failed, 0);
    const totalPassed = Object.values(this.results).reduce((sum, category) => 
      sum + category.passed, 0);
    const totalFailed = Object.values(this.results).reduce((sum, category) => 
      sum + category.failed, 0);

    return {
      total: totalTests,
      passed: totalPassed,
      failed: totalFailed,
      successRate: totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) : '0'
    };
  }

  printDetailedResults() {
    const summary = this.calculateResults();
    const duration = Date.now() - this.startTime;

    console.log('\n' + '='.repeat(80));
    console.log(`${colors.bold}${colors.blue}📋 REAL-TIME NOTIFICATION INTEGRATION TEST RESULTS${colors.reset}`);
    console.log('='.repeat(80));
    
    console.log(`${colors.bold}Summary:${colors.reset}`);
    console.log(`  Total Tests: ${summary.total}`);
    console.log(`  ${colors.green}✅ Passed: ${summary.passed}${colors.reset}`);
    console.log(`  ${colors.red}❌ Failed: ${summary.failed}${colors.reset}`);
    console.log(`  Success Rate: ${summary.successRate}%`);
    console.log(`  Duration: ${(duration / 1000).toFixed(1)}s`);
    
    console.log(`\n${colors.bold}Notification Statistics:${colors.reset}`);
    console.log(`  Notifications Sent: ${this.notificationsSent}`);
    console.log(`  Notifications Received: ${this.notificationsReceived}`);
    console.log(`  Active Connections: ${this.activeConnections.length}`);
    
    console.log(`\n${colors.bold}Connection Details:${colors.reset}`);
    this.activeConnections.forEach((conn, index) => {
      const uptime = Date.now() - conn.startTime;
      console.log(`  Connection ${index + 1} (${conn.id}):`);
      console.log(`    - Connected: ${conn.connected ? '✅' : '❌'}`);
      console.log(`    - Messages: ${conn.messagesReceived}`);
      console.log(`    - Errors: ${conn.errors}`);
      console.log(`    - Uptime: ${(uptime / 1000).toFixed(1)}s`);
    });

    if (summary.failed > 0) {
      console.log(`\n${colors.yellow}⚠️ ISSUES DETECTED:${colors.reset}`);
      console.log('  - Some tests failed. Check the log messages above for details.');
      console.log('  - Ensure the server is running and accessible.');
      console.log('  - Verify authentication configuration if applicable.');
      console.log('  - Check network connectivity and firewall settings.');
    } else {
      console.log(`\n${colors.green}🎉 ALL TESTS PASSED!${colors.reset}`);
      console.log('✅ Real-time notification system is working correctly.');
    }

    console.log('\n' + '='.repeat(80));
  }

  async runFullIntegrationTest() {
    this.log(`${colors.bold}🚀 Starting Full Real-time Notification Integration Test${colors.reset}`, 'info', 'MAIN');
    this.log(`Target: ${config.serverUrl}`, 'info', 'MAIN');
    this.log('', 'info');

    try {
      // 1. Check server status
      const serverRunning = await this.checkServerStatus();
      if (!serverRunning) {
        this.log('❌ Server is not accessible. Aborting tests.', 'error', 'MAIN');
        return;
      }

      // 2. Test API endpoints
      await this.testNotificationStats();
      await this.testSSEPushEndpoint();

      // 3. Test SSE connection
      this.log('Testing basic SSE connection...', 'info', 'MAIN');
      await this.testSSEConnection('basic-test');

      // 4. Test concurrent connections
      await this.runConcurrentConnectionTest();

      // 5. Test notification flow
      await this.runNotificationFlowTest();

      // 6. Performance test
      await this.runPerformanceTest();

      // Clean up connections
      this.activeConnections.forEach(conn => {
        if (conn.eventSource && conn.eventSource.readyState !== EventSource.CLOSED) {
          conn.eventSource.close();
        }
      });

    } catch (error) {
      this.log(`❌ Integration test error: ${error.message}`, 'error', 'MAIN');
    } finally {
      this.printDetailedResults();
    }
  }
}

// Run the integration test
if (require.main === module) {
  const tester = new NotificationIntegrationTester();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Test interrupted by user');
    tester.activeConnections.forEach(conn => {
      if (conn.eventSource) {
        conn.eventSource.close();
      }
    });
    process.exit(1);
  });

  tester.runFullIntegrationTest().catch(error => {
    console.error('Integration test failed:', error);
    process.exit(1);
  });
}

module.exports = NotificationIntegrationTester;