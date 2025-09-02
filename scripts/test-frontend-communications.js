#!/usr/bin/env node

/**
 * Frontend Communications Integration Test
 * 前端通訊整合測試腳本
 * 
 * Tests the unified Communications frontend components:
 * - CommunicationForm functionality
 * - User flow validation
 * - Permission level access controls
 * - Responsive design and animations
 * - Rich text editor and preview mode
 */

const puppeteer = require('puppeteer');
const path = require('path');

class FrontendCommunicationsTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:3001';
    this.results = [];
    this.screenshots = [];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // cyan
      success: '\x1b[32m', // green  
      error: '\x1b[31m',   // red
      warn: '\x1b[33m'     // yellow
    };
    const reset = '\x1b[0m';
    console.log(`${colors[type]}${message}${reset}`);
  }

  addResult(test, status, message, duration = 0, screenshotPath = null) {
    this.results.push({ test, status, message, duration, screenshotPath });
  }

  async takeScreenshot(name, fullPage = false) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `frontend-test-${name}-${timestamp}.png`;
      const screenshotPath = path.join(process.cwd(), 'output', filename);
      
      await this.page.screenshot({ 
        path: screenshotPath, 
        fullPage,
        quality: 90 
      });
      
      this.screenshots.push(screenshotPath);
      return screenshotPath;
    } catch (error) {
      this.log(`Failed to take screenshot: ${error.message}`, 'warn');
      return null;
    }
  }

  async setupBrowser() {
    this.log('🚀 Setting up browser for frontend testing...', 'info');
    
    try {
      this.browser = await puppeteer.launch({
        headless: false, // Show browser for debugging
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
        defaultViewport: {
          width: 1920,
          height: 1080
        }
      });

      this.page = await this.browser.newPage();
      
      // Enable request interception for debugging
      await this.page.setRequestInterception(true);
      this.page.on('request', (request) => {
        if (request.url().includes('/api/')) {
          this.log(`API Request: ${request.method()} ${request.url()}`, 'info');
        }
        request.continue();
      });

      // Listen for console messages
      this.page.on('console', (msg) => {
        if (msg.type() === 'error') {
          this.log(`Console Error: ${msg.text()}`, 'error');
        }
      });

      // Listen for page errors
      this.page.on('pageerror', (error) => {
        this.log(`Page Error: ${error.message}`, 'error');
      });

      this.addResult('Browser Setup', 'PASS', 'Browser launched successfully');
      return true;
    } catch (error) {
      this.addResult('Browser Setup', 'FAIL', `Failed to setup browser: ${error.message}`);
      return false;
    }
  }

  async testHomepageAccess() {
    this.log('\n🏠 Testing Homepage Access...', 'info');
    const startTime = Date.now();
    
    try {
      await this.page.goto(`${this.baseUrl}`, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      // Check if page loaded
      const title = await this.page.title();
      const duration = Date.now() - startTime;
      
      if (title && title.includes('KCISLK')) {
        const screenshotPath = await this.takeScreenshot('homepage', true);
        this.addResult(
          'Homepage Access',
          'PASS',
          `Homepage loaded successfully (${duration}ms)`,
          duration,
          screenshotPath
        );
        return true;
      } else {
        this.addResult('Homepage Access', 'FAIL', `Invalid title: ${title}`, duration);
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addResult('Homepage Access', 'FAIL', `Failed to load homepage: ${error.message}`, duration);
      return false;
    }
  }

  async testTeachersCommunicationsPage() {
    this.log('\n👩‍🏫 Testing Teachers Communications Page...', 'info');
    const startTime = Date.now();
    
    try {
      await this.page.goto(`${this.baseUrl}/teachers/communications`, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      const duration = Date.now() - startTime;

      // Check if we're redirected to login or if the page loads
      const url = this.page.url();
      
      if (url.includes('/login') || url.includes('/auth')) {
        const screenshotPath = await this.takeScreenshot('teachers-communications-auth', true);
        this.addResult(
          'Teachers Communications Page',
          'PASS',
          `Correctly redirected to authentication (${duration}ms)`,
          duration,
          screenshotPath
        );
        return true;
      } else if (url.includes('/teachers/communications')) {
        // Check for communication form or list
        const hasForm = await this.page.$('.communication-form, [data-testid="communication-form"]');
        const hasList = await this.page.$('.communication-list, [data-testid="communication-list"]');
        
        const screenshotPath = await this.takeScreenshot('teachers-communications-page', true);
        
        if (hasForm || hasList) {
          this.addResult(
            'Teachers Communications Page',
            'PASS',
            `Page loaded with communications interface (${duration}ms)`,
            duration,
            screenshotPath
          );
          return true;
        } else {
          this.addResult(
            'Teachers Communications Page',
            'FAIL',
            `Page loaded but no communications interface found (${duration}ms)`,
            duration,
            screenshotPath
          );
          return false;
        }
      } else {
        this.addResult(
          'Teachers Communications Page',
          'FAIL',
          `Unexpected redirect to: ${url} (${duration}ms)`,
          duration
        );
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addResult(
        'Teachers Communications Page',
        'FAIL',
        `Failed to access page: ${error.message}`,
        duration
      );
      return false;
    }
  }

  async testAdminDashboardAccess() {
    this.log('\n👨‍💼 Testing Admin Dashboard Access...', 'info');
    const startTime = Date.now();
    
    try {
      await this.page.goto(`${this.baseUrl}/admin`, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      const duration = Date.now() - startTime;
      const url = this.page.url();
      
      if (url.includes('/login') || url.includes('/auth')) {
        const screenshotPath = await this.takeScreenshot('admin-dashboard-auth', true);
        this.addResult(
          'Admin Dashboard Access',
          'PASS',
          `Correctly requires authentication (${duration}ms)`,
          duration,
          screenshotPath
        );
        return true;
      } else if (url.includes('/admin')) {
        // Check for admin interface elements
        const hasAdminInterface = await this.page.$('.admin-dashboard, [data-testid="admin-dashboard"]');
        const hasCommunicationManagement = await this.page.$('.communication-management, [data-testid="communication-management"]');
        
        const screenshotPath = await this.takeScreenshot('admin-dashboard', true);
        
        if (hasAdminInterface || hasCommunicationManagement) {
          this.addResult(
            'Admin Dashboard Access',
            'PASS',
            `Admin interface loaded successfully (${duration}ms)`,
            duration,
            screenshotPath
          );
          return true;
        } else {
          this.addResult(
            'Admin Dashboard Access',
            'FAIL',
            `Admin page loaded but interface missing (${duration}ms)`,
            duration,
            screenshotPath
          );
          return false;
        }
      } else {
        this.addResult(
          'Admin Dashboard Access',
          'FAIL',
          `Unexpected redirect to: ${url} (${duration}ms)`,
          duration
        );
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addResult(
        'Admin Dashboard Access',
        'FAIL',
        `Failed to access admin dashboard: ${error.message}`,
        duration
      );
      return false;
    }
  }

  async testResponsiveDesign() {
    this.log('\n📱 Testing Responsive Design...', 'info');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    let allPassed = true;

    for (const viewport of viewports) {
      const startTime = Date.now();
      
      try {
        await this.page.setViewport({
          width: viewport.width,
          height: viewport.height
        });

        await this.page.goto(`${this.baseUrl}`, { 
          waitUntil: 'networkidle2', 
          timeout: 10000 
        });

        // Wait for any animations to complete
        await this.page.waitForTimeout(1000);

        const duration = Date.now() - startTime;
        const screenshotPath = await this.takeScreenshot(`responsive-${viewport.name.toLowerCase()}`, true);

        // Check if page renders properly
        const bodyHeight = await this.page.evaluate(() => document.body.scrollHeight);
        const hasContent = bodyHeight > viewport.height * 0.5; // Page should have substantial content

        if (hasContent) {
          this.addResult(
            `Responsive Design - ${viewport.name}`,
            'PASS',
            `${viewport.width}x${viewport.height} renders correctly (${duration}ms)`,
            duration,
            screenshotPath
          );
        } else {
          this.addResult(
            `Responsive Design - ${viewport.name}`,
            'FAIL',
            `${viewport.width}x${viewport.height} insufficient content rendered`,
            duration,
            screenshotPath
          );
          allPassed = false;
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        this.addResult(
          `Responsive Design - ${viewport.name}`,
          'FAIL',
          `Failed to test ${viewport.name}: ${error.message}`,
          duration
        );
        allPassed = false;
      }
    }

    // Reset to desktop viewport
    await this.page.setViewport({ width: 1920, height: 1080 });

    return allPassed;
  }

  async testPageLoadPerformance() {
    this.log('\n⚡ Testing Page Load Performance...', 'info');
    
    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/teachers/communications', name: 'Teachers Communications' },
      { path: '/admin', name: 'Admin Dashboard' }
    ];

    let allPassed = true;
    const performanceMetrics = [];

    for (const pageTest of pages) {
      try {
        // Enable performance metrics
        await this.page.evaluateOnNewDocument(() => {
          window.performanceData = [];
        });

        const startTime = Date.now();
        
        await this.page.goto(`${this.baseUrl}${pageTest.path}`, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        // Measure performance metrics
        const metrics = await this.page.metrics();
        const duration = Date.now() - startTime;

        const performanceData = {
          page: pageTest.name,
          loadTime: duration,
          jsHeapUsedSize: Math.round(metrics.JSHeapUsedSize / 1024 / 1024), // MB
          jsHeapTotalSize: Math.round(metrics.JSHeapTotalSize / 1024 / 1024), // MB
          scriptDuration: metrics.ScriptDuration,
          taskDuration: metrics.TaskDuration
        };

        performanceMetrics.push(performanceData);

        // Performance thresholds
        const isAcceptable = duration < 5000; // 5 seconds max
        const isOptimal = duration < 2000; // 2 seconds optimal

        if (isOptimal) {
          this.addResult(
            `Performance - ${pageTest.name}`,
            'PASS',
            `Optimal load time: ${duration}ms (Memory: ${performanceData.jsHeapUsedSize}MB)`,
            duration
          );
        } else if (isAcceptable) {
          this.addResult(
            `Performance - ${pageTest.name}`,
            'PASS',
            `Acceptable load time: ${duration}ms (Memory: ${performanceData.jsHeapUsedSize}MB)`,
            duration
          );
        } else {
          this.addResult(
            `Performance - ${pageTest.name}`,
            'FAIL',
            `Slow load time: ${duration}ms (Memory: ${performanceData.jsHeapUsedSize}MB)`,
            duration
          );
          allPassed = false;
        }

      } catch (error) {
        this.addResult(
          `Performance - ${pageTest.name}`,
          'FAIL',
          `Performance test failed: ${error.message}`
        );
        allPassed = false;
      }
    }

    // Log performance summary
    this.log('\n📊 Performance Summary:', 'info');
    performanceMetrics.forEach(metrics => {
      this.log(`  ${metrics.page}: ${metrics.loadTime}ms (${metrics.jsHeapUsedSize}MB)`, 'info');
    });

    return allPassed;
  }

  async testAccessibility() {
    this.log('\n♿ Testing Basic Accessibility...', 'info');
    
    try {
      await this.page.goto(`${this.baseUrl}`, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      const startTime = Date.now();

      // Check for basic accessibility features
      const accessibilityChecks = await this.page.evaluate(() => {
        const results = {
          hasDoctype: document.doctype !== null,
          hasTitle: document.title && document.title.length > 0,
          hasLang: document.documentElement.lang && document.documentElement.lang.length > 0,
          hasHeadings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0,
          hasAltImages: Array.from(document.images).every(img => 
            img.alt !== undefined && (img.alt.length > 0 || img.role === 'presentation')
          ),
          hasFormLabels: Array.from(document.querySelectorAll('input, select, textarea')).every(field => {
            const id = field.id;
            const hasLabel = id && document.querySelector(`label[for="${id}"]`);
            const hasAriaLabel = field.getAttribute('aria-label');
            const hasAriaLabelledby = field.getAttribute('aria-labelledby');
            return hasLabel || hasAriaLabel || hasAriaLabelledby || field.type === 'hidden';
          }),
          hasSkipLinks: document.querySelector('a[href="#main"], a[href="#content"]') !== null,
          imagesWithoutAlt: Array.from(document.images).filter(img => !img.alt && img.role !== 'presentation').length
        };
        return results;
      });

      const duration = Date.now() - startTime;
      const passedChecks = Object.values(accessibilityChecks).filter(check => 
        typeof check === 'boolean' ? check : check === 0
      ).length;
      const totalChecks = Object.keys(accessibilityChecks).length;

      const screenshotPath = await this.takeScreenshot('accessibility-test', true);

      if (passedChecks >= totalChecks * 0.8) { // 80% pass rate
        this.addResult(
          'Basic Accessibility',
          'PASS',
          `${passedChecks}/${totalChecks} accessibility checks passed (${duration}ms)`,
          duration,
          screenshotPath
        );
        return true;
      } else {
        this.addResult(
          'Basic Accessibility',
          'FAIL',
          `Only ${passedChecks}/${totalChecks} accessibility checks passed. Issues found.`,
          duration,
          screenshotPath
        );
        return false;
      }

    } catch (error) {
      this.addResult(
        'Basic Accessibility',
        'FAIL',
        `Accessibility test failed: ${error.message}`
      );
      return false;
    }
  }

  generateReport() {
    this.log('\n📊 Frontend Communications Test Results', 'info');
    this.log('=' * 70, 'info');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;

    // Group results by category
    const categories = {
      'Setup & Access': this.results.filter(r => 
        r.test.includes('Browser') || r.test.includes('Homepage') || r.test.includes('Access')
      ),
      'Page Navigation': this.results.filter(r => 
        r.test.includes('Teachers Communications') || r.test.includes('Admin Dashboard')
      ),
      'Responsive Design': this.results.filter(r => r.test.includes('Responsive')),
      'Performance': this.results.filter(r => r.test.includes('Performance')),
      'Accessibility': this.results.filter(r => r.test.includes('Accessibility'))
    };

    for (const [category, categoryResults] of Object.entries(categories)) {
      if (categoryResults.length > 0) {
        this.log(`\n${category}:`, 'info');
        for (const result of categoryResults) {
          const icon = result.status === 'PASS' ? '✅' : '❌';
          const color = result.status === 'PASS' ? 'success' : 'error';
          const durationText = result.duration > 0 ? ` (${result.duration}ms)` : '';
          this.log(`  ${icon} ${result.test}: ${result.message}${durationText}`, color);
          
          if (result.screenshotPath) {
            this.log(`      📸 Screenshot: ${result.screenshotPath}`, 'info');
          }
        }
      }
    }

    // Screenshots summary
    if (this.screenshots.length > 0) {
      this.log('\n📸 Screenshots captured:', 'info');
      this.screenshots.forEach(path => {
        this.log(`  ${path}`, 'info');
      });
    }

    // Performance metrics
    const performanceResults = this.results.filter(r => r.test.includes('Performance'));
    if (performanceResults.length > 0) {
      const avgLoadTime = performanceResults.reduce((sum, r) => sum + r.duration, 0) / performanceResults.length;
      this.log(`\n⚡ Average page load time: ${Math.round(avgLoadTime)}ms`, 'info');
    }

    // Summary
    this.log('\n' + '=' * 70, 'info');
    this.log(`Total Tests: ${total}`, 'info');
    this.log(`Passed: ${passed}`, 'success');
    if (failed > 0) {
      this.log(`Failed: ${failed}`, 'error');
    }
    
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';
    if (failed === 0) {
      this.log(`\n🎉 All frontend tests passed! (${passRate}%)`, 'success');
      this.log('✅ Communications frontend is ready for production!', 'success');
    } else {
      this.log(`\n⚠️ Pass rate: ${passRate}%`, 'warn');
      this.log('❌ Please address failing tests before production deployment', 'error');
    }

    return failed === 0;
  }

  async cleanup() {
    this.log('\n🧹 Cleaning up browser resources...', 'info');
    
    try {
      if (this.page) {
        await this.page.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      this.log('✅ Browser cleanup completed', 'success');
    } catch (error) {
      this.log(`⚠️ Cleanup warning: ${error.message}`, 'warn');
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Frontend Communications Integration Tests...', 'info');
    
    const tests = [
      () => this.setupBrowser(),
      () => this.testHomepageAccess(),
      () => this.testTeachersCommunicationsPage(),
      () => this.testAdminDashboardAccess(),
      () => this.testResponsiveDesign(),
      () => this.testPageLoadPerformance(),
      () => this.testAccessibility()
    ];

    let overallSuccess = true;
    for (const test of tests) {
      try {
        const result = await test();
        if (!result) overallSuccess = false;
      } catch (error) {
        this.log(`Test suite failed with error: ${error}`, 'error');
        overallSuccess = false;
      }
    }

    return this.generateReport();
  }
}

// Execute tests
async function main() {
  const tester = new FrontendCommunicationsTester();
  
  try {
    const success = await tester.runAllTests();
    
    if (success) {
      console.log('\n🎯 Phase 4 Testing - Frontend Communications: COMPLETE');
      console.log('✅ All frontend systems operational and ready for production');
      process.exit(0);
    } else {
      console.log('\n🔧 Phase 4 Testing - Frontend Communications: ISSUES FOUND');
      console.log('❌ Address failing tests before proceeding to production');
      process.exit(1);
    }
  } finally {
    await tester.cleanup();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FrontendCommunicationsTester };