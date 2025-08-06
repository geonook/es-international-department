/**
 * Docker Configuration Test Script
 * KCISLK ESID Info Hub - Docker 配置測試腳本
 * 
 * This script validates the Docker configuration without actually building
 * the Docker image, useful when Docker is not available locally.
 */

import fs from 'fs'
import path from 'path'

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
}

const tests: TestResult[] = []

/**
 * Test if a file exists
 */
function testFileExists(filePath: string, description: string): boolean {
  const fullPath = path.join(process.cwd(), filePath)
  const exists = fs.existsSync(fullPath)
  
  tests.push({
    test: description,
    status: exists ? 'PASS' : 'FAIL',
    message: exists ? `Found: ${filePath}` : `Missing: ${filePath}`
  })
  
  return exists
}

/**
 * Test file content
 */
function testFileContent(filePath: string, searchTerm: string, description: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    const content = fs.readFileSync(fullPath, 'utf8')
    const found = content.includes(searchTerm)
    
    tests.push({
      test: description,
      status: found ? 'PASS' : 'FAIL',
      message: found ? `Found "${searchTerm}" in ${filePath}` : `Missing "${searchTerm}" in ${filePath}`
    })
    
    return found
  } catch (error) {
    tests.push({
      test: description,
      status: 'FAIL',
      message: `Error reading ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
    return false
  }
}

/**
 * Test package.json scripts
 */
function testPackageScripts() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    const scripts = packageContent.scripts || {}
    
    const requiredScripts = ['build', 'start', 'db:generate']
    
    requiredScripts.forEach(script => {
      const exists = script in scripts
      tests.push({
        test: `Package script: ${script}`,
        status: exists ? 'PASS' : 'FAIL',
        message: exists ? `Script "${script}": ${scripts[script]}` : `Missing script: ${script}`
      })
    })
  } catch (error) {
    tests.push({
      test: 'Package.json validation',
      status: 'FAIL',
      message: `Error reading package.json: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
}

/**
 * Main test function
 */
function runTests() {
  console.log('🐳 Docker Configuration Test')
  console.log('=' .repeat(50))
  console.log('')

  // Test required files
  console.log('📁 File Existence Tests:')
  testFileExists('Dockerfile', 'Dockerfile exists')
  testFileExists('.dockerignore', '.dockerignore exists')
  testFileExists('next.config.mjs', 'Next.js config exists')
  testFileExists('app/api/health/route.ts', 'Health check endpoint exists')
  testFileExists('prisma/schema.prisma', 'Prisma schema exists')
  testFileExists('package.json', 'Package.json exists')
  testFileExists('pnpm-lock.yaml', 'pnpm lock file exists')
  
  console.log('')
  console.log('📝 Content Validation Tests:')
  
  // Test Dockerfile content
  testFileContent('Dockerfile', 'FROM node:22-slim', 'Dockerfile uses correct base image')
  testFileContent('Dockerfile', 'pnpm install', 'Dockerfile uses pnpm')
  testFileContent('Dockerfile', 'pnpm run build', 'Dockerfile includes build step')
  testFileContent('Dockerfile', 'pnpm run db:generate', 'Dockerfile includes Prisma generation')
  testFileContent('Dockerfile', 'EXPOSE 8080', 'Dockerfile exposes port 8080')
  
  // Test Next.js config
  testFileContent('next.config.mjs', 'output: \'standalone\'', 'Next.js configured for standalone output')
  
  // Test .dockerignore
  testFileContent('.dockerignore', 'node_modules', '.dockerignore excludes node_modules')
  testFileContent('.dockerignore', '.env', '.dockerignore excludes environment files')
  
  console.log('')
  console.log('⚙️  Package Scripts Tests:')
  testPackageScripts()
  
  console.log('')
  console.log('📊 Test Results Summary:')
  console.log('=' .repeat(50))
  
  const passCount = tests.filter(t => t.status === 'PASS').length
  const failCount = tests.filter(t => t.status === 'FAIL').length
  const warnCount = tests.filter(t => t.status === 'WARN').length
  
  tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✅' : test.status === 'WARN' ? '⚠️' : '❌'
    console.log(`${icon} ${test.test}: ${test.message}`)
  })
  
  console.log('')
  console.log(`Total Tests: ${tests.length}`)
  console.log(`✅ Passed: ${passCount}`)
  console.log(`⚠️  Warnings: ${warnCount}`)
  console.log(`❌ Failed: ${failCount}`)
  
  if (failCount === 0) {
    console.log('')
    console.log('🎉 All tests passed! Docker configuration is ready for deployment.')
    console.log('')
    console.log('📋 Next Steps:')
    console.log('1. Commit the Docker configuration files')
    console.log('2. Push to GitHub repository')
    console.log('3. Deploy to Zeabur with the following environment variables:')
    console.log('   - DATABASE_URL (your Zeabur PostgreSQL connection string)')
    console.log('   - NODE_ENV=production')
  } else {
    console.log('')
    console.log('⚠️  Some tests failed. Please fix the issues before deployment.')
    process.exit(1)
  }
}

// Run the tests
runTests()