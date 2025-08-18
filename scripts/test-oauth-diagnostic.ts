#!/usr/bin/env npx ts-node
/**
 * Google OAuth Configuration Diagnostic Tool
 * Google OAuth 配置診斷工具
 * 
 * This tool helps diagnose Google OAuth configuration issues
 * 此工具協助診斷 Google OAuth 配置問題
 */

import dotenv from 'dotenv'
import { OAuth2Client } from 'google-auth-library'

// Load environment variables
dotenv.config()

interface DiagnosticResult {
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string
}

class OAuthDiagnostic {
  private results: DiagnosticResult[] = []

  private addResult(status: DiagnosticResult['status'], message: string, details?: string) {
    this.results.push({ status, message, details })
  }

  private logResult(result: DiagnosticResult) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'
    console.log(`${icon} ${result.message}`)
    if (result.details) {
      console.log(`   ${result.details}`)
    }
  }

  /**
   * Test environment variable configuration
   */
  testEnvironmentVariables() {
    console.log('\n🔍 Testing Environment Variables...')
    
    const requiredVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'NEXTAUTH_URL',
      'JWT_SECRET',
      'NEXTAUTH_SECRET'
    ]

    for (const varName of requiredVars) {
      const value = process.env[varName]
      if (!value) {
        this.addResult('fail', `Missing environment variable: ${varName}`)
      } else {
        // Show partial values for security
        const displayValue = varName.includes('SECRET') || varName.includes('KEY') 
          ? `${value.substring(0, 10)}...` 
          : varName === 'GOOGLE_CLIENT_ID' 
            ? `${value.substring(0, 20)}...`
            : value
        
        this.addResult('pass', `${varName} is set`, `Value: ${displayValue}`)
      }
    }
  }

  /**
   * Test Google OAuth client configuration
   */
  testGoogleOAuthClient() {
    console.log('\n🔍 Testing Google OAuth Client...')

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const nextAuthUrl = process.env.NEXTAUTH_URL

    if (!clientId || !clientSecret) {
      this.addResult('fail', 'Google OAuth credentials missing')
      return
    }

    // Validate Client ID format
    if (!clientId.endsWith('.apps.googleusercontent.com')) {
      this.addResult('fail', 'Invalid Google Client ID format', 
        'Should end with .apps.googleusercontent.com')
    } else {
      this.addResult('pass', 'Google Client ID format is valid')
    }

    // Validate Client Secret format
    if (!clientSecret.startsWith('GOCSPX-')) {
      this.addResult('warning', 'Unexpected Google Client Secret format',
        'Modern Google secrets should start with GOCSPX-')
    } else {
      this.addResult('pass', 'Google Client Secret format is valid')
    }

    // Test redirect URI construction
    const redirectUri = nextAuthUrl 
      ? `${nextAuthUrl}/api/auth/callback/google`
      : 'http://localhost:3001/api/auth/callback/google'

    this.addResult('pass', 'Redirect URI constructed', `URI: ${redirectUri}`)

    // Test OAuth2Client instantiation
    try {
      const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri)
      this.addResult('pass', 'OAuth2Client instantiated successfully')

      // Test auth URL generation
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile'
        ],
        state: 'test-state',
        prompt: 'consent'
      })

      this.addResult('pass', 'Auth URL generated successfully', 
        `URL starts with: ${authUrl.substring(0, 50)}...`)

    } catch (error) {
      this.addResult('fail', 'Failed to instantiate OAuth2Client', 
        error instanceof Error ? error.message : 'Unknown error')
    }
  }

  /**
   * Test network connectivity to Google OAuth
   */
  async testGoogleConnectivity() {
    console.log('\n🔍 Testing Google OAuth Connectivity...')

    try {
      // Test connectivity to Google OAuth
      const response = await fetch('https://accounts.google.com/.well-known/openid_configuration')
      
      if (response.ok) {
        this.addResult('pass', 'Google OAuth endpoints are reachable')
        const config = await response.json()
        this.addResult('pass', 'Google OpenID configuration retrieved', 
          `Authorization endpoint: ${config.authorization_endpoint}`)
      } else {
        this.addResult('fail', 'Google OAuth endpoints unreachable', 
          `Status: ${response.status}`)
      }
    } catch (error) {
      this.addResult('fail', 'Network connectivity test failed', 
        error instanceof Error ? error.message : 'Unknown error')
    }
  }

  /**
   * Test local development server
   */
  async testLocalServer() {
    console.log('\n🔍 Testing Local Development Server...')

    try {
      const response = await fetch('http://localhost:3001/api/health')
      
      if (response.ok) {
        this.addResult('pass', 'Local server is running on port 3001')
        
        // Test OAuth endpoint
        const oauthResponse = await fetch('http://localhost:3001/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ redirect: '/test' })
        })

        if (oauthResponse.ok) {
          const data = await oauthResponse.json()
          if (data.success && data.data.authUrl) {
            this.addResult('pass', 'OAuth endpoint responds correctly')
          } else {
            this.addResult('fail', 'OAuth endpoint response invalid', JSON.stringify(data))
          }
        } else {
          this.addResult('fail', 'OAuth endpoint error', `Status: ${oauthResponse.status}`)
        }

      } else {
        this.addResult('fail', 'Local server not responding', `Status: ${response.status}`)
      }
    } catch (error) {
      this.addResult('fail', 'Cannot connect to local server', 
        'Make sure the server is running on port 3001')
    }
  }

  /**
   * Generate Google Console setup instructions
   */
  generateSetupInstructions() {
    console.log('\n📋 Google Cloud Console Setup Instructions:')
    console.log('─'.repeat(60))
    
    const redirectUri = process.env.NEXTAUTH_URL 
      ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
      : 'http://localhost:3001/api/auth/callback/google'

    console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/')
    console.log('2. Select your project or create a new one')
    console.log('3. Navigate to APIs & Services > Credentials')
    console.log('4. Find your OAuth 2.0 Client ID and click Edit')
    console.log('5. In "Authorized redirect URIs", add:')
    console.log(`   ${redirectUri}`)
    console.log('6. Save the configuration')
    console.log('7. Navigate to APIs & Services > OAuth consent screen')
    console.log('8. Add test users (if in testing mode):')
    console.log('   - jason02n@gmail.com')
    console.log('   - admin@kcislk.test')
    console.log('   - teacher@school.edu')
    console.log('   - parent@gmail.com')
    console.log('   - student@gmail.com')
    console.log('9. Ensure the following APIs are enabled:')
    console.log('   - Google+ API')
    console.log('   - Google People API')
    console.log('   - Google OAuth2 API')
  }

  /**
   * Run complete diagnostic
   */
  async runDiagnostic() {
    console.log('🔧 Google OAuth Configuration Diagnostic Tool')
    console.log('=' .repeat(50))

    this.testEnvironmentVariables()
    this.testGoogleOAuthClient()
    await this.testGoogleConnectivity()
    await this.testLocalServer()

    // Display all results
    console.log('\n📊 Diagnostic Results Summary:')
    console.log('─'.repeat(50))

    let passCount = 0
    let failCount = 0
    let warningCount = 0

    this.results.forEach(result => {
      this.logResult(result)
      switch (result.status) {
        case 'pass': passCount++; break
        case 'fail': failCount++; break
        case 'warning': warningCount++; break
      }
    })

    console.log('\n📈 Summary:')
    console.log(`✅ Passed: ${passCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log(`⚠️  Warnings: ${warningCount}`)

    if (failCount > 0) {
      console.log('\n🚨 Issues detected! Please fix the failed items above.')
      this.generateSetupInstructions()
    } else if (warningCount > 0) {
      console.log('\n⚠️  Some warnings detected. Review the items above.')
    } else {
      console.log('\n🎉 All tests passed! Google OAuth should be working correctly.')
    }
  }
}

// Run diagnostic if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const diagnostic = new OAuthDiagnostic()
  diagnostic.runDiagnostic().catch(error => {
    console.error('💥 Diagnostic tool failed:', error)
    process.exit(1)
  })
}

export default OAuthDiagnostic