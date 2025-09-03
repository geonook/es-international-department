#!/usr/bin/env tsx

/**
 * Security Audit Script
 * 安全性稽核腳本
 * 
 * Comprehensive security check for the application
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  description: string
  file?: string
  line?: number
  recommendation: string
}

class SecurityAuditor {
  private issues: SecurityIssue[] = []
  private projectRoot = process.cwd()
  
  async runSecurityAudit(): Promise<void> {
    console.log('🔒 Starting comprehensive security audit...\n')
    
    await this.checkEnvironmentVariables()
    await this.checkJWTSecurity()
    await this.checkPasswordSecurity()
    await this.checkInputValidation()
    await this.checkFileUploadSecurity()
    await this.checkRateLimiting()
    await this.checkCORSConfiguration()
    await this.checkHTTPSConfiguration()
    await this.checkDatabaseSecurity()
    await this.checkDependencyVulnerabilities()
    
    this.generateSecurityReport()
  }
  
  private async checkEnvironmentVariables(): Promise<void> {
    console.log('📋 Checking environment variables...')
    
    const envFiles = ['.env', '.env.development', '.env.staging', '.env.production']
    
    for (const envFile of envFiles) {
      const envPath = path.join(this.projectRoot, envFile)
      
      if (!fs.existsSync(envPath)) {
        continue
      }
      
      const content = fs.readFileSync(envPath, 'utf8')
      const lines = content.split('\n')
      
      lines.forEach((line, index) => {
        const lineNumber = index + 1
        
        // Check for placeholder values
        if (line.includes('your-') || line.includes('placeholder') || line.includes('change-me')) {
          this.issues.push({
            severity: 'high',
            category: 'Environment Variables',
            description: 'Placeholder values found in environment file',
            file: envFile,
            line: lineNumber,
            recommendation: 'Replace all placeholder values with actual secure values'
          })
        }
        
        // Check for weak JWT secrets
        if (line.includes('JWT_SECRET') && line.includes('=')) {
          const secret = line.split('=')[1]?.trim().replace(/"/g, '')
          if (!secret || secret.length < 32) {
            this.issues.push({
              severity: 'critical',
              category: 'JWT Security',
              description: 'JWT secret is too weak or missing',
              file: envFile,
              line: lineNumber,
              recommendation: 'Use a strong JWT secret with at least 32 characters'
            })
          }
        }
        
        // Check for hardcoded passwords
        if (line.toLowerCase().includes('password') && !line.includes('DATABASE_URL')) {
          this.issues.push({
            severity: 'medium',
            category: 'Password Security',
            description: 'Potential hardcoded password in environment file',
            file: envFile,
            line: lineNumber,
            recommendation: 'Ensure passwords are properly secured and not hardcoded'
          })
        }
        
        // Check for database URLs with weak credentials
        if (line.includes('DATABASE_URL') && (line.includes('root:') || line.includes('admin:'))) {
          const url = line.split('=')[1]?.trim()
          if (url && (url.includes('root:password') || url.includes('admin:admin'))) {
            this.issues.push({
              severity: 'high',
              category: 'Database Security',
              description: 'Database using weak default credentials',
              file: envFile,
              line: lineNumber,
              recommendation: 'Use strong, unique database credentials'
            })
          }
        }
      })
    }
  }
  
  private async checkJWTSecurity(): Promise<void> {
    console.log('🔑 Checking JWT security implementation...')
    
    const authFile = path.join(this.projectRoot, 'lib/auth.ts')
    if (!fs.existsSync(authFile)) {
      this.issues.push({
        severity: 'high',
        category: 'JWT Security',
        description: 'JWT authentication file not found',
        recommendation: 'Implement proper JWT authentication'
      })
      return
    }
    
    const content = fs.readFileSync(authFile, 'utf8')
    
    // Check for proper token expiration
    if (!content.includes('expirationTime') && !content.includes('exp')) {
      this.issues.push({
        severity: 'medium',
        category: 'JWT Security',
        description: 'JWT tokens may not have proper expiration',
        file: 'lib/auth.ts',
        recommendation: 'Implement proper token expiration times'
      })
    }
    
    // Check for refresh token implementation
    if (!content.includes('refresh') || !content.includes('RefreshToken')) {
      this.issues.push({
        severity: 'medium',
        category: 'JWT Security',
        description: 'Refresh token mechanism not found',
        file: 'lib/auth.ts',
        recommendation: 'Implement refresh token mechanism for better security'
      })
    }
    
    // Check for httpOnly cookies
    if (!content.includes('httpOnly')) {
      this.issues.push({
        severity: 'high',
        category: 'JWT Security',
        description: 'JWT tokens may not be using httpOnly cookies',
        file: 'lib/auth.ts',
        recommendation: 'Use httpOnly cookies to prevent XSS attacks'
      })
    }
  }
  
  private async checkPasswordSecurity(): Promise<void> {
    console.log('🔐 Checking password security...')
    
    const authFile = path.join(this.projectRoot, 'lib/auth.ts')
    if (fs.existsSync(authFile)) {
      const content = fs.readFileSync(authFile, 'utf8')
      
      // Check for bcrypt usage
      if (!content.includes('bcrypt')) {
        this.issues.push({
          severity: 'high',
          category: 'Password Security',
          description: 'Password hashing not using bcrypt',
          file: 'lib/auth.ts',
          recommendation: 'Use bcrypt for password hashing'
        })
      }
      
      // Check for proper salt rounds
      const saltRoundsMatch = content.match(/saltRounds.*=.*(\d+)/)
      if (saltRoundsMatch) {
        const rounds = parseInt(saltRoundsMatch[1])
        if (rounds < 10) {
          this.issues.push({
            severity: 'medium',
            category: 'Password Security',
            description: 'bcrypt salt rounds too low',
            file: 'lib/auth.ts',
            recommendation: 'Use at least 12 salt rounds for bcrypt'
          })
        }
      }
    }
  }
  
  private async checkInputValidation(): Promise<void> {
    console.log('🛡️ Checking input validation...')
    
    const sanitizerFile = path.join(this.projectRoot, 'lib/html-sanitizer.ts')
    if (!fs.existsSync(sanitizerFile)) {
      this.issues.push({
        severity: 'high',
        category: 'Input Validation',
        description: 'HTML sanitizer not found',
        recommendation: 'Implement HTML input sanitization to prevent XSS attacks'
      })
    } else {
      const content = fs.readFileSync(sanitizerFile, 'utf8')
      
      // Check for script tag removal
      if (!content.includes('script')) {
        this.issues.push({
          severity: 'high',
          category: 'Input Validation',
          description: 'HTML sanitizer may not remove script tags',
          file: 'lib/html-sanitizer.ts',
          recommendation: 'Ensure HTML sanitizer removes dangerous script tags'
        })
      }
    }
    
    // Check for SQL injection protection
    const prismaFiles = this.findFiles('**/*.ts', content => content.includes('prisma') && content.includes('raw'))
    if (prismaFiles.length > 0) {
      this.issues.push({
        severity: 'medium',
        category: 'SQL Injection',
        description: 'Raw SQL queries found',
        recommendation: 'Ensure all raw SQL queries use parameterized statements'
      })
    }
  }
  
  private async checkFileUploadSecurity(): Promise<void> {
    console.log('📁 Checking file upload security...')
    
    const uploadFile = path.join(this.projectRoot, 'lib/fileUpload.ts')
    if (fs.existsSync(uploadFile)) {
      const content = fs.readFileSync(uploadFile, 'utf8')
      
      // Check for file type validation
      if (!content.includes('mimetype') && !content.includes('fileType')) {
        this.issues.push({
          severity: 'high',
          category: 'File Upload Security',
          description: 'File upload may not validate file types',
          file: 'lib/fileUpload.ts',
          recommendation: 'Implement proper file type validation'
        })
      }
      
      // Check for file size limits
      if (!content.includes('size') || !content.includes('limit')) {
        this.issues.push({
          severity: 'medium',
          category: 'File Upload Security',
          description: 'File upload may not have size limits',
          file: 'lib/fileUpload.ts',
          recommendation: 'Implement file size limits to prevent DoS attacks'
        })
      }
    }
  }
  
  private async checkRateLimiting(): Promise<void> {
    console.log('⏱️ Checking rate limiting...')
    
    const middlewareFile = path.join(this.projectRoot, 'lib/performance-middleware.ts')
    if (fs.existsSync(middlewareFile)) {
      const content = fs.readFileSync(middlewareFile, 'utf8')
      
      if (!content.includes('rateLimit') && !content.includes('RateLimit')) {
        this.issues.push({
          severity: 'medium',
          category: 'Rate Limiting',
          description: 'Rate limiting implementation not found in middleware',
          recommendation: 'Implement rate limiting to prevent abuse'
        })
      }
    } else {
      this.issues.push({
        severity: 'medium',
        category: 'Rate Limiting',
        description: 'Performance middleware not found',
        recommendation: 'Implement rate limiting middleware'
      })
    }
  }
  
  private async checkCORSConfiguration(): Promise<void> {
    console.log('🌐 Checking CORS configuration...')
    
    // Check for CORS configuration in Next.js config
    const nextConfigFiles = ['next.config.js', 'next.config.ts', 'next.config.mjs']
    let corsFound = false
    
    for (const configFile of nextConfigFiles) {
      const configPath = path.join(this.projectRoot, configFile)
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf8')
        if (content.includes('cors') || content.includes('CORS')) {
          corsFound = true
          break
        }
      }
    }
    
    if (!corsFound) {
      this.issues.push({
        severity: 'medium',
        category: 'CORS Configuration',
        description: 'CORS configuration not found',
        recommendation: 'Configure CORS properly to control cross-origin requests'
      })
    }
  }
  
  private async checkHTTPSConfiguration(): Promise<void> {
    console.log('🔐 Checking HTTPS configuration...')
    
    // Check for secure cookie settings
    const authFiles = this.findFiles('**/*.ts', content => content.includes('cookie') && content.includes('secure'))
    if (authFiles.length === 0) {
      this.issues.push({
        severity: 'medium',
        category: 'HTTPS Configuration',
        description: 'Cookies may not be configured for HTTPS only',
        recommendation: 'Set secure flag on cookies in production'
      })
    }
  }
  
  private async checkDatabaseSecurity(): Promise<void> {
    console.log('🗄️ Checking database security...')
    
    const prismaSchema = path.join(this.projectRoot, 'prisma/schema.prisma')
    if (fs.existsSync(prismaSchema)) {
      const content = fs.readFileSync(prismaSchema, 'utf8')
      
      // Check for sensitive data exposure
      if (content.includes('password') && !content.includes('@map')) {
        this.issues.push({
          severity: 'low',
          category: 'Database Security',
          description: 'Password field may be exposed in database schema',
          file: 'prisma/schema.prisma',
          recommendation: 'Consider using @map directive to obscure field names'
        })
      }
    }
  }
  
  private async checkDependencyVulnerabilities(): Promise<void> {
    console.log('📦 Checking dependency vulnerabilities...')
    
    try {
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' })
      const audit = JSON.parse(auditResult)
      
      if (audit.vulnerabilities && Object.keys(audit.vulnerabilities).length > 0) {
        const criticalCount = Object.values(audit.vulnerabilities).filter((v: any) => v.severity === 'critical').length
        const highCount = Object.values(audit.vulnerabilities).filter((v: any) => v.severity === 'high').length
        
        if (criticalCount > 0) {
          this.issues.push({
            severity: 'critical',
            category: 'Dependencies',
            description: `${criticalCount} critical vulnerability(ies) found in dependencies`,
            recommendation: 'Run "npm audit fix" and update vulnerable dependencies immediately'
          })
        }
        
        if (highCount > 0) {
          this.issues.push({
            severity: 'high',
            category: 'Dependencies',
            description: `${highCount} high severity vulnerability(ies) found in dependencies`,
            recommendation: 'Update vulnerable dependencies as soon as possible'
          })
        }
      }
    } catch (error) {
      console.log('  - Could not run npm audit (this is normal in some environments)')
    }
  }
  
  private findFiles(pattern: string, contentFilter?: (content: string) => boolean): string[] {
    const files: string[] = []
    
    const searchDir = (dir: string) => {
      if (dir.includes('node_modules') || dir.includes('.next') || dir.includes('coverage')) {
        return
      }
      
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          
          if (entry.isDirectory()) {
            searchDir(fullPath)
          } else if (entry.isFile() && fullPath.endsWith('.ts')) {
            if (contentFilter) {
              const content = fs.readFileSync(fullPath, 'utf8')
              if (contentFilter(content)) {
                files.push(fullPath)
              }
            } else {
              files.push(fullPath)
            }
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    }
    
    searchDir(this.projectRoot)
    return files
  }
  
  private generateSecurityReport(): void {
    const criticalIssues = this.issues.filter(i => i.severity === 'critical')
    const highIssues = this.issues.filter(i => i.severity === 'high')
    const mediumIssues = this.issues.filter(i => i.severity === 'medium')
    const lowIssues = this.issues.filter(i => i.severity === 'low')
    
    console.log('\n🔒 Security Audit Report')
    console.log('='.repeat(50))
    console.log(`Total Issues Found: ${this.issues.length}`)
    console.log(`🔴 Critical: ${criticalIssues.length}`)
    console.log(`🟠 High: ${highIssues.length}`)
    console.log(`🟡 Medium: ${mediumIssues.length}`)
    console.log(`⚪ Low: ${lowIssues.length}`)
    console.log()
    
    // Show all issues grouped by severity
    const severityGroups = [
      { level: 'critical', issues: criticalIssues, emoji: '🔴' },
      { level: 'high', issues: highIssues, emoji: '🟠' },
      { level: 'medium', issues: mediumIssues, emoji: '🟡' },
      { level: 'low', issues: lowIssues, emoji: '⚪' }
    ]
    
    for (const group of severityGroups) {
      if (group.issues.length > 0) {
        console.log(`${group.emoji} ${group.level.toUpperCase()} SEVERITY ISSUES:`)
        
        group.issues.forEach((issue, index) => {
          console.log(`\n${index + 1}. ${issue.category}: ${issue.description}`)
          if (issue.file) {
            console.log(`   File: ${issue.file}${issue.line ? `:${issue.line}` : ''}`)
          }
          console.log(`   Recommendation: ${issue.recommendation}`)
        })
        
        console.log()
      }
    }
    
    // Save JSON report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.issues.length,
        critical: criticalIssues.length,
        high: highIssues.length,
        medium: mediumIssues.length,
        low: lowIssues.length
      },
      issues: this.issues
    }
    
    const outputPath = path.join(this.projectRoot, 'output', 'security-audit-report.json')
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
    console.log(`📄 Detailed security report saved to: ${outputPath}`)
    
    // Exit with error if critical or high issues found
    if (criticalIssues.length > 0 || highIssues.length > 0) {
      console.log('\n❌ Critical or high severity security issues found!')
      console.log('Please address these issues before deploying to production.')
      process.exit(1)
    } else if (this.issues.length === 0) {
      console.log('\n✅ No security issues found. Great job!')
    } else {
      console.log('\n⚠️  Some medium/low severity issues found.')
      console.log('Consider addressing these to improve security posture.')
    }
  }
}

async function main() {
  const auditor = new SecurityAuditor()
  await auditor.runSecurityAudit()
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Security audit failed:', error)
    process.exit(1)
  })
}