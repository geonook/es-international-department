#!/usr/bin/env ts-node

/**
 * Production OAuth Configuration Validator
 * 正式環境 OAuth 配置驗證工具
 * 
 * This script validates the complete OAuth setup for production deployment.
 * 此腳本驗證正式環境部署的完整 OAuth 設定。
 */

import https from 'https';
import { URL } from 'url';

// Production Configuration
const PRODUCTION_CONFIG = {
  domain: 'kcislk-esid.zeabur.app',
  protocol: 'https',
  callbackPath: '/api/auth/callback/google',
  loginPath: '/login',
  healthPath: '/api/health',
} as const;

interface ValidationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: string;
}

class ProductionOAuthValidator {
  private results: ValidationResult[] = [];
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${PRODUCTION_CONFIG.protocol}://${PRODUCTION_CONFIG.domain}`;
  }

  /**
   * Log validation result
   */
  private log(result: ValidationResult): void {
    this.results.push(result);
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${result.test}: ${result.message}`);
    if (result.details) {
      console.log(`   📋 ${result.details}`);
    }
  }

  /**
   * Make HTTP/HTTPS request
   */
  private async makeRequest(url: string, timeout: number = 10000): Promise<{ status: number; headers: any; body: string }> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        timeout,
        headers: {
          'User-Agent': 'KCISLK-ESID-OAuth-Validator/1.0'
        }
      };

      const request = https.request(options, (response) => {
        let body = '';
        response.on('data', (chunk) => body += chunk);
        response.on('end', () => {
          resolve({
            status: response.statusCode || 0,
            headers: response.headers,
            body
          });
        });
      });

      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error(`Request timeout after ${timeout}ms`));
      });

      request.end();
    });
  }

  /**
   * Test 1: Domain accessibility and HTTPS
   */
  async testDomainAccessibility(): Promise<void> {
    try {
      const response = await this.makeRequest(this.baseUrl);
      
      if (response.status === 200 || response.status === 301 || response.status === 302) {
        this.log({
          test: 'Domain Accessibility',
          status: 'PASS',
          message: `Production domain ${PRODUCTION_CONFIG.domain} is accessible`,
          details: `HTTP Status: ${response.status}`
        });
      } else {
        this.log({
          test: 'Domain Accessibility',
          status: 'FAIL',
          message: `Domain returned unexpected status: ${response.status}`,
          details: 'Check if the application is deployed and running'
        });
      }
    } catch (error) {
      this.log({
        test: 'Domain Accessibility',
        status: 'FAIL',
        message: `Cannot reach production domain: ${(error as Error).message}`,
        details: 'Ensure the application is deployed to Zeabur and DNS is configured'
      });
    }
  }

  /**
   * Test 2: HTTPS enforcement
   */
  async testHTTPS(): Promise<void> {
    try {
      // Test HTTP redirect to HTTPS
      const httpUrl = `http://${PRODUCTION_CONFIG.domain}`;
      const response = await this.makeRequest(httpUrl);
      
      if (response.status === 301 || response.status === 302) {
        const location = response.headers.location;
        if (location && location.startsWith('https://')) {
          this.log({
            test: 'HTTPS Enforcement',
            status: 'PASS',
            message: 'HTTP traffic is properly redirected to HTTPS',
            details: `Redirect location: ${location}`
          });
        } else {
          this.log({
            test: 'HTTPS Enforcement',
            status: 'WARN',
            message: 'HTTP redirect exists but may not point to HTTPS',
            details: `Redirect location: ${location || 'none'}`
          });
        }
      } else {
        this.log({
          test: 'HTTPS Enforcement',
          status: 'WARN',
          message: 'HTTP redirect not detected - verify HTTPS enforcement',
          details: 'Production should redirect HTTP to HTTPS automatically'
        });
      }
    } catch (error) {
      this.log({
        test: 'HTTPS Enforcement',
        status: 'WARN',
        message: 'Could not test HTTP to HTTPS redirect',
        details: (error as Error).message
      });
    }
  }

  /**
   * Test 3: Health endpoint
   */
  async testHealthEndpoint(): Promise<void> {
    try {
      const healthUrl = `${this.baseUrl}${PRODUCTION_CONFIG.healthPath}`;
      const response = await this.makeRequest(healthUrl);
      
      if (response.status === 200) {
        this.log({
          test: 'Health Endpoint',
          status: 'PASS',
          message: 'Application health endpoint is responding',
          details: `Response: ${response.body.substring(0, 100)}...`
        });
      } else {
        this.log({
          test: 'Health Endpoint',
          status: 'FAIL',
          message: `Health endpoint returned status ${response.status}`,
          details: 'Check if the health API route is properly configured'
        });
      }
    } catch (error) {
      this.log({
        test: 'Health Endpoint',
        status: 'FAIL',
        message: `Health endpoint test failed: ${(error as Error).message}`,
        details: 'Verify /api/health route is implemented and accessible'
      });
    }
  }

  /**
   * Test 4: OAuth callback URL structure
   */
  testCallbackUrlStructure(): void {
    const callbackUrl = `${this.baseUrl}${PRODUCTION_CONFIG.callbackPath}`;
    const expectedUrl = 'https://kcislk-esid.zeabur.app/api/auth/callback/google';
    
    if (callbackUrl === expectedUrl) {
      this.log({
        test: 'OAuth Callback URL Structure',
        status: 'PASS',
        message: 'OAuth callback URL structure is correct',
        details: callbackUrl
      });
    } else {
      this.log({
        test: 'OAuth Callback URL Structure',
        status: 'FAIL',
        message: 'OAuth callback URL structure mismatch',
        details: `Expected: ${expectedUrl}, Got: ${callbackUrl}`
      });
    }
  }

  /**
   * Test 5: Login page accessibility
   */
  async testLoginPage(): Promise<void> {
    try {
      const loginUrl = `${this.baseUrl}${PRODUCTION_CONFIG.loginPath}`;
      const response = await this.makeRequest(loginUrl);
      
      if (response.status === 200) {
        // Check if the response contains Google OAuth elements
        const hasGoogleAuth = response.body.includes('google') || response.body.includes('Google');
        
        this.log({
          test: 'Login Page Accessibility',
          status: hasGoogleAuth ? 'PASS' : 'WARN',
          message: hasGoogleAuth ? 'Login page accessible with Google OAuth elements' : 'Login page accessible but Google OAuth elements not detected',
          details: `Response size: ${response.body.length} bytes`
        });
      } else {
        this.log({
          test: 'Login Page Accessibility',
          status: 'FAIL',
          message: `Login page returned status ${response.status}`,
          details: 'Check if the login page is properly configured'
        });
      }
    } catch (error) {
      this.log({
        test: 'Login Page Accessibility',
        status: 'FAIL',
        message: `Login page test failed: ${(error as Error).message}`,
        details: 'Verify /login route is implemented and accessible'
      });
    }
  }

  /**
   * Test 6: Environment variable checks
   */
  testEnvironmentConfiguration(): void {
    const requiredVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'JWT_SECRET',
      'DATABASE_URL'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      this.log({
        test: 'Environment Variables',
        status: 'PASS',
        message: 'All required environment variables are set',
        details: `Checked: ${requiredVars.join(', ')}`
      });
    } else {
      this.log({
        test: 'Environment Variables',
        status: 'FAIL',
        message: `Missing required environment variables: ${missingVars.join(', ')}`,
        details: 'Set these variables in Zeabur console for production deployment'
      });
    }

    // Test specific OAuth configuration
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    if (nextAuthUrl === `${this.baseUrl}`) {
      this.log({
        test: 'NEXTAUTH_URL Configuration',
        status: 'PASS',
        message: 'NEXTAUTH_URL matches production domain',
        details: nextAuthUrl
      });
    } else {
      this.log({
        test: 'NEXTAUTH_URL Configuration',
        status: 'WARN',
        message: 'NEXTAUTH_URL may not match production domain',
        details: `Current: ${nextAuthUrl}, Expected: ${this.baseUrl}`
      });
    }
  }

  /**
   * Test 7: Google OAuth configuration
   */
  testGoogleOAuthConfiguration(): void {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // Test Client ID format
    if (clientId && clientId.endsWith('.apps.googleusercontent.com')) {
      this.log({
        test: 'Google OAuth Client ID',
        status: 'PASS',
        message: 'GOOGLE_CLIENT_ID format is correct',
        details: `${clientId.substring(0, 20)}...`
      });
    } else {
      this.log({
        test: 'Google OAuth Client ID',
        status: 'FAIL',
        message: 'GOOGLE_CLIENT_ID format is invalid or missing',
        details: 'Must end with .apps.googleusercontent.com'
      });
    }

    // Test Client Secret format
    if (clientSecret && clientSecret.startsWith('GOCSPX-')) {
      this.log({
        test: 'Google OAuth Client Secret',
        status: 'PASS',
        message: 'GOOGLE_CLIENT_SECRET format is correct',
        details: 'GOCSPX-***'
      });
    } else {
      this.log({
        test: 'Google OAuth Client Secret',
        status: 'FAIL',
        message: 'GOOGLE_CLIENT_SECRET format is invalid or missing',
        details: 'Must start with GOCSPX-'
      });
    }
  }

  /**
   * Generate final report
   */
  generateReport(): void {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;
    const total = this.results.length;

    console.log('\n' + '='.repeat(60));
    console.log('🎯 PRODUCTION OAUTH VALIDATION REPORT');
    console.log('📍 Domain: https://kcislk-esid.zeabur.app');
    console.log('🔗 OAuth Callback: https://kcislk-esid.zeabur.app/api/auth/callback/google');
    console.log('='.repeat(60));
    
    console.log(`📊 Results: ${passed}/${total} tests passed`);
    if (failed > 0) console.log(`❌ Failed: ${failed}`);
    if (warnings > 0) console.log(`⚠️ Warnings: ${warnings}`);

    if (failed === 0 && warnings === 0) {
      console.log('\n🎉 ALL TESTS PASSED! OAuth production setup is ready.');
      console.log('✅ You can proceed with production deployment.');
    } else if (failed === 0) {
      console.log('\n✅ Core tests passed with some warnings.');
      console.log('⚠️ Review warnings before production deployment.');
    } else {
      console.log('\n❌ CRITICAL ISSUES DETECTED!');
      console.log('🛠️ Fix failed tests before production deployment.');
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Configure Google OAuth in Google Cloud Console');
    console.log('2. Set environment variables in Zeabur console');
    console.log('3. Test OAuth flow: https://kcislk-esid.zeabur.app/login');
    console.log('4. Monitor application logs for errors');

    console.log('\n🔗 Documentation:');
    console.log('- Setup Guide: /docs/PRODUCTION-OAUTH-SETUP.md');
    console.log('- Environment Template: /.env.production.example');
    console.log('- OAuth Security: /docs/OAUTH-SECURITY-CHECKLIST.md');
  }

  /**
   * Run all validation tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Production OAuth Configuration Validation...\n');
    
    // Run tests in sequence
    await this.testDomainAccessibility();
    await this.testHTTPS();
    await this.testHealthEndpoint();
    this.testCallbackUrlStructure();
    await this.testLoginPage();
    this.testEnvironmentConfiguration();
    this.testGoogleOAuthConfiguration();

    this.generateReport();
  }
}

// Main execution
async function main() {
  const validator = new ProductionOAuthValidator();
  await validator.runAllTests();
}

// Run validation if script is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Validation failed with error:', error);
    process.exit(1);
  });
}

export default ProductionOAuthValidator;