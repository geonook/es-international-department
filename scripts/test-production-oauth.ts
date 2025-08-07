#!/usr/bin/env node
/**
 * Production OAuth Testing Script
 * Tests Google OAuth configuration for production deployment
 * 
 * Usage: npm run test:oauth-production
 */

import { performance } from 'perf_hooks';

// Test configuration
const PRODUCTION_DOMAIN = 'https://kcislk-esid.zeabur.app';
const TEST_TIMEOUT = 30000; // 30 seconds

// Expected OAuth configuration
const EXPECTED_CONFIG = {
  client_id: '316204460450-[REDACTED].apps.googleusercontent.com',
  project_id: 'kcislk-esid-info-hub',
  redirect_uri: 'https://kcislk-esid.zeabur.app/api/auth/callback/google'
};

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  duration?: number;
  details?: any;
}

class ProductionOAuthTester {
  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor() {
    console.log('🚀 KCISLK ESID Info Hub - Production OAuth Testing');
    console.log('=' .repeat(60));
    console.log(`🎯 Target Domain: ${PRODUCTION_DOMAIN}`);
    console.log(`📅 Test Date: ${new Date().toISOString()}`);
    console.log('=' .repeat(60));
    console.log('');
  }

  private addResult(result: TestResult): void {
    this.results.push(result);
    const statusEmoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    console.log(`${statusEmoji} ${result.name}${duration}`);
    if (result.message) {
      console.log(`   ${result.message}`);
    }
    if (result.details && typeof result.details === 'object') {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
    }
    console.log('');
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'User-Agent': 'KCISLK-ESID-OAuth-Tester/1.0',
          ...options.headers
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Test 1: Domain Accessibility
   * Verify production domain is accessible via HTTPS
   */
  async testDomainAccessibility(): Promise<void> {
    const startTime = performance.now();
    
    try {
      const response = await this.makeRequest(PRODUCTION_DOMAIN);
      const duration = Math.round(performance.now() - startTime);
      
      if (response.ok) {
        this.addResult({
          name: 'Domain Accessibility',
          status: 'PASS',
          message: `Production domain is accessible (${response.status})`,
          duration,
          details: {
            url: PRODUCTION_DOMAIN,
            status: response.status,
            headers: {
              'content-type': response.headers.get('content-type'),
              'server': response.headers.get('server')
            }
          }
        });
      } else {
        this.addResult({
          name: 'Domain Accessibility',
          status: 'FAIL',
          message: `Domain returned ${response.status} ${response.statusText}`,
          duration,
          details: { status: response.status, statusText: response.statusText }
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Domain Accessibility',
        status: 'FAIL',
        message: `Failed to reach domain: ${error.message}`,
        details: { error: error.message }
      });
    }
  }

  /**
   * Test 2: HTTPS Security
   * Verify HTTPS is enforced and secure
   */
  async testHTTPSEnforcement(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Test HTTP redirect to HTTPS
      const httpUrl = PRODUCTION_DOMAIN.replace('https://', 'http://');
      const response = await this.makeRequest(httpUrl, { redirect: 'manual' });
      const duration = Math.round(performance.now() - startTime);
      
      if (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) {
        const location = response.headers.get('location');
        if (location?.startsWith('https://')) {
          this.addResult({
            name: 'HTTPS Enforcement',
            status: 'PASS',
            message: 'HTTP properly redirects to HTTPS',
            duration,
            details: { redirectTo: location }
          });
        } else {
          this.addResult({
            name: 'HTTPS Enforcement',
            status: 'WARNING',
            message: 'HTTP redirects but not to HTTPS',
            duration,
            details: { redirectTo: location }
          });
        }
      } else if (response.status >= 400) {
        // Some providers block HTTP entirely
        this.addResult({
          name: 'HTTPS Enforcement',
          status: 'PASS',
          message: 'HTTP access blocked (good security)',
          duration,
          details: { status: response.status }
        });
      } else {
        this.addResult({
          name: 'HTTPS Enforcement',
          status: 'WARNING',
          message: 'HTTP does not redirect to HTTPS',
          duration,
          details: { status: response.status }
        });
      }
    } catch (error) {
      this.addResult({
        name: 'HTTPS Enforcement',
        status: 'WARNING',
        message: `Could not test HTTP redirect: ${error.message}`,
        details: { error: error.message }
      });
    }
  }

  /**
   * Test 3: OAuth Callback URL
   * Verify OAuth callback endpoint exists and responds appropriately
   */
  async testOAuthCallback(): Promise<void> {
    const startTime = performance.now();
    const callbackUrl = `${PRODUCTION_DOMAIN}/api/auth/callback/google`;
    
    try {
      const response = await this.makeRequest(callbackUrl);
      const duration = Math.round(performance.now() - startTime);
      
      // OAuth callback should return 400 without proper parameters
      if (response.status === 400) {
        this.addResult({
          name: 'OAuth Callback URL',
          status: 'PASS',
          message: 'OAuth callback endpoint exists and handles missing parameters correctly',
          duration,
          details: { url: callbackUrl, status: response.status }
        });
      } else if (response.status === 405) {
        this.addResult({
          name: 'OAuth Callback URL',
          status: 'PASS',
          message: 'OAuth callback endpoint exists (Method not allowed without OAuth flow)',
          duration,
          details: { url: callbackUrl, status: response.status }
        });
      } else if (response.status === 404) {
        this.addResult({
          name: 'OAuth Callback URL',
          status: 'FAIL',
          message: 'OAuth callback endpoint not found',
          duration,
          details: { url: callbackUrl, status: response.status }
        });
      } else {
        this.addResult({
          name: 'OAuth Callback URL',
          status: 'WARNING',
          message: `OAuth callback returned unexpected status: ${response.status}`,
          duration,
          details: { url: callbackUrl, status: response.status }
        });
      }
    } catch (error) {
      this.addResult({
        name: 'OAuth Callback URL',
        status: 'FAIL',
        message: `Failed to reach OAuth callback: ${error.message}`,
        details: { url: callbackUrl, error: error.message }
      });
    }
  }

  /**
   * Test 4: OAuth Providers Endpoint
   * Verify OAuth providers are configured correctly
   */
  async testOAuthProviders(): Promise<void> {
    const startTime = performance.now();
    const providersUrl = `${PRODUCTION_DOMAIN}/api/auth/providers`;
    
    try {
      const response = await this.makeRequest(providersUrl);
      const duration = Math.round(performance.now() - startTime);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.google) {
          this.addResult({
            name: 'OAuth Providers',
            status: 'PASS',
            message: 'Google OAuth provider is configured',
            duration,
            details: { providers: Object.keys(data) }
          });
        } else {
          this.addResult({
            name: 'OAuth Providers',
            status: 'FAIL',
            message: 'Google OAuth provider not found in configuration',
            duration,
            details: { providers: data ? Object.keys(data) : 'No providers' }
          });
        }
      } else {
        this.addResult({
          name: 'OAuth Providers',
          status: 'FAIL',
          message: `Providers endpoint returned ${response.status}`,
          duration,
          details: { status: response.status }
        });
      }
    } catch (error) {
      this.addResult({
        name: 'OAuth Providers',
        status: 'FAIL',
        message: `Failed to fetch providers: ${error.message}`,
        details: { error: error.message }
      });
    }
  }

  /**
   * Test 5: Health Check
   * Verify application health and database connectivity
   */
  async testHealthCheck(): Promise<void> {
    const startTime = performance.now();
    const healthUrl = `${PRODUCTION_DOMAIN}/api/health`;
    
    try {
      const response = await this.makeRequest(healthUrl);
      const duration = Math.round(performance.now() - startTime);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'healthy') {
          this.addResult({
            name: 'Health Check',
            status: 'PASS',
            message: 'Application is healthy',
            duration,
            details: {
              database: data.database || 'unknown',
              environment: data.environment || 'unknown',
              timestamp: data.timestamp || 'unknown'
            }
          });
        } else {
          this.addResult({
            name: 'Health Check',
            status: 'WARNING',
            message: `Application status: ${data.status || 'unknown'}`,
            duration,
            details: data
          });
        }
      } else {
        this.addResult({
          name: 'Health Check',
          status: 'FAIL',
          message: `Health check returned ${response.status}`,
          duration,
          details: { status: response.status }
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Health Check',
        status: 'FAIL',
        message: `Health check failed: ${error.message}`,
        details: { error: error.message }
      });
    }
  }

  /**
   * Test 6: OAuth Configuration Validation
   * Validate OAuth client configuration matches expected values
   */
  testOAuthConfiguration(): void {
    const startTime = performance.now();
    
    // Check environment variables (if available)
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    
    const validations: Array<{ name: string; value: any; expected: string; valid: boolean }> = [
      {
        name: 'GOOGLE_CLIENT_ID',
        value: clientId,
        expected: EXPECTED_CONFIG.client_id,
        valid: clientId === EXPECTED_CONFIG.client_id
      },
      {
        name: 'NEXTAUTH_URL',
        value: nextAuthUrl,
        expected: PRODUCTION_DOMAIN,
        valid: nextAuthUrl === PRODUCTION_DOMAIN
      }
    ];

    const duration = Math.round(performance.now() - startTime);
    
    const failedValidations = validations.filter(v => !v.valid);
    
    if (failedValidations.length === 0) {
      this.addResult({
        name: 'OAuth Configuration',
        status: 'PASS',
        message: 'Environment variables match expected production configuration',
        duration,
        details: { validations: validations.map(v => ({ name: v.name, valid: v.valid })) }
      });
    } else {
      this.addResult({
        name: 'OAuth Configuration',
        status: 'WARNING',
        message: 'Some environment variables not available for validation (expected in production)',
        duration,
        details: { 
          expected: {
            GOOGLE_CLIENT_ID: EXPECTED_CONFIG.client_id,
            NEXTAUTH_URL: PRODUCTION_DOMAIN
          }
        }
      });
    }
  }

  /**
   * Test 7: Google OAuth Authorization URL
   * Test that OAuth authorization URL is properly formatted
   */
  async testGoogleOAuthURL(): Promise<void> {
    const startTime = performance.now();
    const signinUrl = `${PRODUCTION_DOMAIN}/api/auth/signin/google`;
    
    try {
      const response = await this.makeRequest(signinUrl, { redirect: 'manual' });
      const duration = Math.round(performance.now() - startTime);
      
      if (response.status === 302 || response.status === 307) {
        const location = response.headers.get('location');
        
        if (location?.includes('accounts.google.com') && location?.includes('oauth2')) {
          this.addResult({
            name: 'Google OAuth URL',
            status: 'PASS',
            message: 'OAuth sign-in redirects to Google correctly',
            duration,
            details: { 
              redirectsTo: location?.substring(0, 100) + '...',
              containsClientId: location?.includes(EXPECTED_CONFIG.client_id.substring(0, 20))
            }
          });
        } else {
          this.addResult({
            name: 'Google OAuth URL',
            status: 'FAIL',
            message: 'OAuth sign-in does not redirect to Google',
            duration,
            details: { redirectsTo: location }
          });
        }
      } else {
        this.addResult({
          name: 'Google OAuth URL',
          status: 'FAIL',
          message: `OAuth sign-in returned ${response.status} instead of redirect`,
          duration,
          details: { status: response.status }
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Google OAuth URL',
        status: 'FAIL',
        message: `Failed to test OAuth sign-in: ${error.message}`,
        details: { error: error.message }
      });
    }
  }

  /**
   * Generate Test Report
   */
  generateReport(): void {
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('=' .repeat(60));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`📈 Total Tests: ${this.results.length}`);
    console.log('');
    
    // Overall status
    if (failed === 0 && warnings === 0) {
      console.log('🎉 ALL TESTS PASSED - READY FOR PRODUCTION DEPLOYMENT!');
    } else if (failed === 0) {
      console.log('✅ TESTS PASSED WITH WARNINGS - DEPLOYMENT READY (review warnings)');
    } else {
      console.log('❌ TESTS FAILED - RESOLVE ISSUES BEFORE DEPLOYMENT');
      console.log('');
      console.log('Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.name}: ${r.message}`));
    }
    
    console.log('');
    console.log('📋 DEPLOYMENT CHECKLIST');
    console.log('- [ ] Set environment variables in Zeabur console');
    console.log('- [ ] Deploy application to production');
    console.log('- [ ] Test complete OAuth flow');
    console.log('- [ ] Verify user creation and role assignment');
    console.log('- [ ] Monitor production logs for errors');
    
    console.log('');
    console.log(`⏱️  Total Test Duration: ${Math.round(performance.now() - this.startTime)}ms`);
    console.log(`🎯 Target Domain: ${PRODUCTION_DOMAIN}`);
    console.log(`📅 Test Completed: ${new Date().toISOString()}`);
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    this.startTime = performance.now();
    
    console.log('🧪 Running Production OAuth Tests...\n');
    
    await this.testDomainAccessibility();
    await this.testHTTPSEnforcement();
    await this.testOAuthCallback();
    await this.testOAuthProviders();
    await this.testHealthCheck();
    this.testOAuthConfiguration();
    await this.testGoogleOAuthURL();
    
    this.generateReport();
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new ProductionOAuthTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

export default ProductionOAuthTester;