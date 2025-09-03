#!/usr/bin/env tsx

/**
 * API Test Generator
 * API 測試生成器
 * 
 * Automatically generates comprehensive tests for all API endpoints
 */

import fs from 'fs'
import path from 'path'

interface APIEndpoint {
  path: string
  method: string
  file: string
  requiresAuth: boolean
  roles: string[]
  category: string
  description: string
}

class APITestGenerator {
  private endpoints: APIEndpoint[] = []
  private apiDir = path.join(process.cwd(), 'app/api')
  
  async generateAPITests(): Promise<void> {
    console.log('🔍 Analyzing API endpoints...\n')
    
    await this.discoverEndpoints()
    await this.generateTestFiles()
    await this.generateTestMatrix()
    
    console.log('✅ API test generation completed!')
  }
  
  private async discoverEndpoints(): Promise<void> {
    await this.scanDirectory(this.apiDir, '/api')
  }
  
  private async scanDirectory(dir: string, urlPrefix: string): Promise<void> {
    if (!fs.existsSync(dir)) {
      return
    }
    
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory()) {
        const newPrefix = entry.name.startsWith('[') && entry.name.endsWith(']')
          ? `${urlPrefix}/:${entry.name.slice(1, -1)}`
          : `${urlPrefix}/${entry.name}`
        
        await this.scanDirectory(fullPath, newPrefix)
      } else if (entry.name === 'route.ts') {
        await this.analyzeRouteFile(fullPath, urlPrefix)
      }
    }
  }
  
  private async analyzeRouteFile(filePath: string, urlPrefix: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf8')
    const relativePath = path.relative(this.apiDir, filePath)
    
    // Extract HTTP methods
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    
    for (const method of methods) {
      const exportRegex = new RegExp(`export\\s+async\\s+function\\s+${method}`, 'g')
      if (exportRegex.test(content)) {
        const endpoint: APIEndpoint = {
          path: urlPrefix,
          method,
          file: relativePath,
          requiresAuth: this.requiresAuthentication(content),
          roles: this.extractRequiredRoles(content),
          category: this.categorizeEndpoint(urlPrefix),
          description: this.generateDescription(urlPrefix, method)
        }
        
        this.endpoints.push(endpoint)
      }
    }
  }
  
  private requiresAuthentication(content: string): boolean {
    const authIndicators = [
      'getCurrentUser',
      'verifyAuth',
      'authentication',
      'auth-token',
      'Authorization',
      'Bearer',
      'jwt',
      'JWT'
    ]
    
    return authIndicators.some(indicator => content.includes(indicator))
  }
  
  private extractRequiredRoles(content: string): string[] {
    const roles: string[] = []
    
    if (content.includes('admin') || content.includes('ADMIN')) {
      roles.push('admin')
    }
    if (content.includes('office_member') || content.includes('OFFICE_MEMBER')) {
      roles.push('office_member')
    }
    if (content.includes('teacher') || content.includes('TEACHER')) {
      roles.push('office_member') // Teachers are now office members
    }
    if (content.includes('viewer') || content.includes('VIEWER')) {
      roles.push('viewer')
    }
    
    return [...new Set(roles)]
  }
  
  private categorizeEndpoint(path: string): string {
    if (path.includes('/auth')) return 'Authentication'
    if (path.includes('/admin')) return 'Administration'
    if (path.includes('/public')) return 'Public'
    if (path.includes('/teachers')) return 'Teachers'
    if (path.includes('/events')) return 'Events'
    if (path.includes('/announcements')) return 'Announcements'
    if (path.includes('/resources')) return 'Resources'
    if (path.includes('/notifications')) return 'Notifications'
    if (path.includes('/upload')) return 'File Upload'
    if (path.includes('/email')) return 'Email'
    if (path.includes('/settings')) return 'Settings'
    if (path.includes('/health')) return 'Health Check'
    
    return 'General'
  }
  
  private generateDescription(path: string, method: string): string {
    const action = this.getActionFromMethod(method)
    const resource = this.getResourceFromPath(path)
    
    return `${action} ${resource}`
  }
  
  private getActionFromMethod(method: string): string {
    const actions = {
      GET: 'Retrieve',
      POST: 'Create',
      PUT: 'Update',
      PATCH: 'Modify',
      DELETE: 'Delete'
    }
    
    return actions[method as keyof typeof actions] || 'Process'
  }
  
  private getResourceFromPath(path: string): string {
    const parts = path.split('/').filter(Boolean)
    const resource = parts[parts.length - 1]
    
    if (resource?.startsWith(':')) {
      return parts[parts.length - 2] || 'resource'
    }
    
    return resource || 'resource'
  }
  
  private async generateTestFiles(): Promise<void> {
    console.log('📝 Generating test files...')
    
    // Group endpoints by category
    const categories = [...new Set(this.endpoints.map(e => e.category))]
    
    for (const category of categories) {
      const categoryEndpoints = this.endpoints.filter(e => e.category === category)
      await this.generateCategoryTestFile(category, categoryEndpoints)
    }
  }
  
  private async generateCategoryTestFile(category: string, endpoints: APIEndpoint[]): Promise<void> {
    const fileName = `${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}.test.ts`
    const filePath = path.join(process.cwd(), 'tests/api', fileName)
    
    const testContent = this.generateTestFileContent(category, endpoints)
    
    // Ensure directory exists
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(filePath, testContent)
    console.log(`  ✅ Generated ${fileName}`)
  }
  
  private generateTestFileContent(category: string, endpoints: APIEndpoint[]): string {
    const imports = `/**
 * ${category} API Tests
 * ${category} API 測試
 * 
 * Auto-generated comprehensive tests for ${category.toLowerCase()} endpoints
 */

import { NextRequest } from 'next/server'
import { 
  mockUsers,
  TestAuthHelpers,
  TestAPIHelpers,
  TestValidationHelpers 
} from '../utils/test-helpers'

`

    const describe = `describe('${category} API Endpoints', () => {
  
`

    const endpointTests = endpoints.map(endpoint => this.generateEndpointTest(endpoint)).join('\n\n')
    
    const closing = `
})`

    return imports + describe + endpointTests + closing
  }
  
  private generateEndpointTest(endpoint: APIEndpoint): string {
    const testName = `${endpoint.method} ${endpoint.path}`
    const description = `should ${endpoint.description.toLowerCase()}`
    
    let testContent = `  describe('${testName}', () => {
    test('${description}', async () => {
      // TODO: Import the actual handler
      // const handler = require('@/app/api${endpoint.file.replace('/route.ts', '/route')}')`
    
    if (endpoint.requiresAuth) {
      testContent += `
      
      // This endpoint requires authentication
      const user = mockUsers.${endpoint.roles.includes('admin') ? 'admin' : 'officeMember'}
      const request = await TestAuthHelpers.createAuthenticatedRequest(
        'http://localhost:3000${endpoint.path}',
        '${endpoint.method}',
        user`
      
      if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
        testContent += `,
        { /* Add test data here */ }`
      }
      
      testContent += `
      )
      
      // TODO: Call the handler and test response
      // const response = await handler.${endpoint.method}(request)
      // expect(response.status).toBe(200)
      // 
      // const data = await response.json()
      // expect(data.success).toBe(true)`
    } else {
      testContent += `
      
      // This endpoint is public
      const request = new NextRequest('http://localhost:3000${endpoint.path}', {
        method: '${endpoint.method}'`
      
      if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
        testContent += `,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* Add test data here */ })`
      }
      
      testContent += `
      })
      
      // TODO: Call the handler and test response
      // const response = await handler.${endpoint.method}(request)
      // expect(response.status).toBe(200)`
    }
    
    if (endpoint.requiresAuth && endpoint.roles.length > 0) {
      testContent += `
    })
    
    test('should reject unauthorized access', async () => {
      const request = new NextRequest('http://localhost:3000${endpoint.path}', {
        method: '${endpoint.method}'
      })
      
      // TODO: Test without authentication
      // const response = await handler.${endpoint.method}(request)
      // expect(response.status).toBe(401)
    })
    
    test('should reject insufficient permissions', async () => {
      const user = mockUsers.viewer // Lower permission user
      const request = await TestAuthHelpers.createAuthenticatedRequest(
        'http://localhost:3000${endpoint.path}',
        '${endpoint.method}',
        user
      )
      
      // TODO: Test with insufficient permissions
      // const response = await handler.${endpoint.method}(request)
      // expect(response.status).toBe(403)`
    }
    
    testContent += `
    })
  })`
    
    return testContent
  }
  
  private async generateTestMatrix(): Promise<void> {
    console.log('📊 Generating test matrix...')
    
    const matrix = {
      summary: {
        totalEndpoints: this.endpoints.length,
        byCategory: {} as Record<string, number>,
        byMethod: {} as Record<string, number>,
        requireAuth: this.endpoints.filter(e => e.requiresAuth).length,
        publicEndpoints: this.endpoints.filter(e => !e.requiresAuth).length
      },
      endpoints: this.endpoints,
      testCoverage: {
        categories: [...new Set(this.endpoints.map(e => e.category))],
        methods: [...new Set(this.endpoints.map(e => e.method))],
        authTypes: {
          authenticated: this.endpoints.filter(e => e.requiresAuth).length,
          public: this.endpoints.filter(e => !e.requiresAuth).length
        },
        roleRequirements: {
          admin: this.endpoints.filter(e => e.roles.includes('admin')).length,
          officeMember: this.endpoints.filter(e => e.roles.includes('office_member')).length,
          viewer: this.endpoints.filter(e => e.roles.includes('viewer')).length
        }
      }
    }
    
    // Calculate category counts
    for (const endpoint of this.endpoints) {
      matrix.summary.byCategory[endpoint.category] = (matrix.summary.byCategory[endpoint.category] || 0) + 1
      matrix.summary.byMethod[endpoint.method] = (matrix.summary.byMethod[endpoint.method] || 0) + 1
    }
    
    // Save matrix to file
    const matrixPath = path.join(process.cwd(), 'output/api-test-matrix.json')
    
    // Ensure output directory exists
    const outputDir = path.dirname(matrixPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    fs.writeFileSync(matrixPath, JSON.stringify(matrix, null, 2))
    
    // Display summary
    console.log('\n📋 API Test Matrix Summary:')
    console.log(`Total Endpoints: ${matrix.summary.totalEndpoints}`)
    console.log(`Authenticated: ${matrix.summary.requireAuth}`)
    console.log(`Public: ${matrix.summary.publicEndpoints}`)
    
    console.log('\nBy Category:')
    Object.entries(matrix.summary.byCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`)
    })
    
    console.log('\nBy Method:')
    Object.entries(matrix.summary.byMethod).forEach(([method, count]) => {
      console.log(`  ${method}: ${count}`)
    })
    
    console.log(`\n📄 Complete matrix saved to: ${matrixPath}`)
  }
}

async function main() {
  const generator = new APITestGenerator()
  await generator.generateAPITests()
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ API test generation failed:', error)
    process.exit(1)
  })
}