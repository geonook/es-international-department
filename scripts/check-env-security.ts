#!/usr/bin/env tsx

/**
 * Environment Variables Security Check
 * 環境變數安全性檢查
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

interface EnvSecurityIssue {
  file: string
  variable: string
  issue: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  recommendation: string
}

class EnvironmentSecurityChecker {
  private issues: EnvSecurityIssue[] = []
  
  async checkEnvironmentSecurity(): Promise<void> {
    console.log('🔍 Checking environment variables security...\n')
    
    const envFiles = [
      '.env',
      '.env.local',
      '.env.development', 
      '.env.staging',
      '.env.production',
      '.env.test'
    ]
    
    for (const envFile of envFiles) {
      await this.checkEnvFile(envFile)
    }
    
    this.generateReport()
  }
  
  private async checkEnvFile(fileName: string): Promise<void> {
    const filePath = path.join(process.cwd(), fileName)
    
    if (!fs.existsSync(filePath)) {
      return
    }
    
    console.log(`📋 Checking ${fileName}...`)
    
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const lineNumber = i + 1
      
      if (!line || line.startsWith('#')) {
        continue
      }
      
      const [key, value] = line.split('=', 2)
      if (!key || !value) {
        continue
      }
      
      await this.checkVariable(fileName, key.trim(), value.trim(), lineNumber)
    }
  }
  
  private async checkVariable(file: string, key: string, value: string, line: number): Promise<void> {
    const cleanValue = value.replace(/['"]/g, '')
    
    // Check for placeholder values
    if (this.isPlaceholderValue(cleanValue)) {
      this.issues.push({
        file,
        variable: key,
        issue: 'Contains placeholder value',
        severity: 'high',
        recommendation: 'Replace placeholder with actual secure value'
      })
    }
    
    // Check JWT secrets
    if (key.includes('JWT_SECRET')) {
      await this.checkJWTSecret(file, key, cleanValue)
    }
    
    // Check database URLs
    if (key.includes('DATABASE_URL')) {
      this.checkDatabaseURL(file, key, cleanValue)
    }
    
    // Check Google OAuth credentials
    if (key.includes('GOOGLE_CLIENT')) {
      this.checkGoogleCredentials(file, key, cleanValue)
    }
    
    // Check API keys
    if (key.toLowerCase().includes('api_key') || key.toLowerCase().includes('secret')) {
      this.checkAPIKey(file, key, cleanValue)
    }
    
    // Check for hardcoded passwords
    if (key.toLowerCase().includes('password') && !key.includes('DATABASE_URL')) {
      this.checkPassword(file, key, cleanValue)
    }
    
    // Check for development vs production values
    if (file.includes('production') && this.isDevelopmentValue(cleanValue)) {
      this.issues.push({
        file,
        variable: key,
        issue: 'Development value used in production environment',
        severity: 'critical',
        recommendation: 'Use production-appropriate secure values'
      })
    }
  }
  
  private isPlaceholderValue(value: string): boolean {
    const placeholderPatterns = [
      /your-.*-here/i,
      /placeholder/i,
      /change.?me/i,
      /replace.?this/i,
      /example/i,
      /test.?value/i,
      /^your-/i
    ]
    
    return placeholderPatterns.some(pattern => pattern.test(value))
  }
  
  private async checkJWTSecret(file: string, key: string, value: string): Promise<void> {
    if (!value) {
      this.issues.push({
        file,
        variable: key,
        issue: 'JWT secret is empty',
        severity: 'critical',
        recommendation: 'Generate a strong JWT secret with at least 32 characters'
      })
      return
    }
    
    // Check length
    if (value.length < 32) {
      this.issues.push({
        file,
        variable: key,
        issue: 'JWT secret is too short',
        severity: 'high',
        recommendation: 'Use a JWT secret with at least 32 characters'
      })
    }
    
    // Check if it's base64 encoded (recommended)
    try {
      const decoded = Buffer.from(value, 'base64')
      if (decoded.length < 32) {
        this.issues.push({
          file,
          variable: key,
          issue: 'JWT secret (decoded) is too short',
          severity: 'medium',
          recommendation: 'Use a longer base64-encoded secret'
        })
      }
    } catch {
      // Not base64, check if it's random enough
      const entropy = this.calculateEntropy(value)
      if (entropy < 4.5) {
        this.issues.push({
          file,
          variable: key,
          issue: 'JWT secret has low entropy (not random enough)',
          severity: 'medium',
          recommendation: 'Use a cryptographically random JWT secret'
        })
      }
    }
    
    // Check for common weak patterns
    if (/^[a-z]+$/i.test(value) || /^\d+$/.test(value)) {
      this.issues.push({
        file,
        variable: key,
        issue: 'JWT secret uses only letters or numbers',
        severity: 'medium',
        recommendation: 'Use a JWT secret with mixed characters, numbers, and symbols'
      })
    }
  }
  
  private checkDatabaseURL(file: string, key: string, value: string): void {
    if (!value || this.isPlaceholderValue(value)) {
      return
    }
    
    try {
      const url = new URL(value)
      
      // Check for weak credentials
      const username = url.username
      const password = url.password
      
      if (username === 'root' && (password === 'password' || password === 'root')) {
        this.issues.push({
          file,
          variable: key,
          issue: 'Database using default/weak credentials',
          severity: 'critical',
          recommendation: 'Use strong, unique database credentials'
        })
      }
      
      // Check password strength
      if (password && password.length < 12) {
        this.issues.push({
          file,
          variable: key,
          issue: 'Database password is too short',
          severity: 'medium',
          recommendation: 'Use a database password with at least 12 characters'
        })
      }
      
      // Check for localhost in production
      if (file.includes('production') && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
        this.issues.push({
          file,
          variable: key,
          issue: 'Production environment using localhost database',
          severity: 'high',
          recommendation: 'Use a proper production database server'
        })
      }
    } catch (error) {
      this.issues.push({
        file,
        variable: key,
        issue: 'Invalid database URL format',
        severity: 'medium',
        recommendation: 'Ensure database URL is properly formatted'
      })
    }
  }
  
  private checkGoogleCredentials(file: string, key: string, value: string): void {
    if (this.isPlaceholderValue(value)) {
      return // Already reported as placeholder
    }
    
    if (key.includes('CLIENT_ID')) {
      if (!value.includes('.apps.googleusercontent.com')) {
        this.issues.push({
          file,
          variable: key,
          issue: 'Invalid Google Client ID format',
          severity: 'high',
          recommendation: 'Use a valid Google OAuth Client ID from Google Console'
        })
      }
    }
    
    if (key.includes('CLIENT_SECRET')) {
      if (value.length < 20) {
        this.issues.push({
          file,
          variable: key,
          issue: 'Google Client Secret appears to be invalid',
          severity: 'high',
          recommendation: 'Use the correct Google OAuth Client Secret from Google Console'
        })
      }
    }
  }
  
  private checkAPIKey(file: string, key: string, value: string): void {
    if (this.isPlaceholderValue(value)) {
      return // Already reported as placeholder
    }
    
    if (value.length < 16) {
      this.issues.push({
        file,
        variable: key,
        issue: 'API key is too short',
        severity: 'medium',
        recommendation: 'Use a longer, more secure API key'
      })
    }
    
    const entropy = this.calculateEntropy(value)
    if (entropy < 4.0) {
      this.issues.push({
        file,
        variable: key,
        issue: 'API key has low entropy',
        severity: 'medium',
        recommendation: 'Use a cryptographically random API key'
      })
    }
  }
  
  private checkPassword(file: string, key: string, value: string): void {
    if (this.isPlaceholderValue(value)) {
      return // Already reported as placeholder
    }
    
    if (value.length < 8) {
      this.issues.push({
        file,
        variable: key,
        issue: 'Password is too short',
        severity: 'high',
        recommendation: 'Use a password with at least 12 characters'
      })
    }
    
    // Check for common weak passwords
    const weakPasswords = [
      'password', 'admin', 'root', '123456', 'qwerty',
      'password123', 'admin123', 'letmein', 'welcome'
    ]
    
    if (weakPasswords.includes(value.toLowerCase())) {
      this.issues.push({
        file,
        variable: key,
        issue: 'Using a common weak password',
        severity: 'critical',
        recommendation: 'Use a strong, unique password'
      })
    }
  }
  
  private isDevelopmentValue(value: string): boolean {
    const devPatterns = [
      /localhost/i,
      /127\.0\.0\.1/,
      /test/i,
      /dev/i,
      /development/i,
      /local/i
    ]
    
    return devPatterns.some(pattern => pattern.test(value))
  }
  
  private calculateEntropy(str: string): number {
    const freq: Record<string, number> = {}
    
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1
    }
    
    let entropy = 0
    const len = str.length
    
    for (const count of Object.values(freq)) {
      const p = count / len
      entropy -= p * Math.log2(p)
    }
    
    return entropy
  }
  
  private generateReport(): void {
    const criticalIssues = this.issues.filter(i => i.severity === 'critical')
    const highIssues = this.issues.filter(i => i.severity === 'high') 
    const mediumIssues = this.issues.filter(i => i.severity === 'medium')
    const lowIssues = this.issues.filter(i => i.severity === 'low')
    
    console.log('\n🔒 Environment Variables Security Report')
    console.log('='.repeat(60))
    console.log(`Total Issues Found: ${this.issues.length}`)
    console.log(`🔴 Critical: ${criticalIssues.length}`)
    console.log(`🟠 High: ${highIssues.length}`)  
    console.log(`🟡 Medium: ${mediumIssues.length}`)
    console.log(`⚪ Low: ${lowIssues.length}`)
    console.log()
    
    // Show issues grouped by severity
    const groups = [
      { level: 'CRITICAL', issues: criticalIssues, emoji: '🔴' },
      { level: 'HIGH', issues: highIssues, emoji: '🟠' },
      { level: 'MEDIUM', issues: mediumIssues, emoji: '🟡' },
      { level: 'LOW', issues: lowIssues, emoji: '⚪' }
    ]
    
    for (const group of groups) {
      if (group.issues.length > 0) {
        console.log(`${group.emoji} ${group.level} SEVERITY ISSUES:`)
        
        group.issues.forEach((issue, index) => {
          console.log(`\n${index + 1}. Variable: ${issue.variable}`)
          console.log(`   File: ${issue.file}`)
          console.log(`   Issue: ${issue.issue}`)
          console.log(`   Recommendation: ${issue.recommendation}`)
        })
        
        console.log()
      }
    }
    
    if (this.issues.length === 0) {
      console.log('✅ No environment security issues found!')
    } else {
      console.log('📋 Recommendations:')
      console.log('1. Generate strong secrets using: openssl rand -base64 32')
      console.log('2. Use different values for different environments')
      console.log('3. Never commit .env files to version control')
      console.log('4. Use environment-specific .env files (.env.production, .env.development)')
      console.log('5. Regularly rotate secrets and API keys')
    }
    
    // Exit with error if critical issues found
    if (criticalIssues.length > 0) {
      console.log('\n❌ Critical environment security issues found!')
      process.exit(1)
    }
  }
}

async function main() {
  const checker = new EnvironmentSecurityChecker()
  await checker.checkEnvironmentSecurity()
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Environment security check failed:', error)
    process.exit(1)
  })
}