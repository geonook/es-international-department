#!/usr/bin/env tsx

/**
 * API Documentation Generation System
 * KCISLK ESID Info Hub - Automatic API Documentation
 * 
 * This script automatically generates comprehensive API documentation by:
 * - Scanning all API routes and endpoints
 * - Analyzing request/response schemas
 * - Generating OpenAPI/Swagger documentation
 * - Creating markdown documentation for developers
 */

import fs from 'fs'
import path from 'path'

interface APIEndpoint {
  path: string
  method: string
  description: string
  category: string
  authentication: 'required' | 'optional' | 'none'
  roles: string[]
  parameters?: {
    path?: Record<string, any>
    query?: Record<string, any>
    body?: Record<string, any>
  }
  responses: {
    [statusCode: string]: {
      description: string
      schema?: any
      example?: any
    }
  }
  examples?: {
    request?: any
    response?: any
  }
}

interface APIDocumentation {
  info: {
    title: string
    version: string
    description: string
    baseUrl: string
  }
  authentication: {
    type: string
    description: string
  }
  endpoints: APIEndpoint[]
  schemas: Record<string, any>
}

class APIDocumentationGenerator {
  private apiRoutes: string[] = []
  private endpoints: APIEndpoint[] = []
  private schemas: Record<string, any> = {}
  
  constructor() {
    this.setupSchemas()
  }
  
  async generateDocumentation(): Promise<void> {
    console.log('📚 Starting API documentation generation...')
    console.log('🔍 Scanning API routes and endpoints\n')
    
    // Scan API routes
    await this.scanAPIRoutes()
    
    // Analyze endpoints
    await this.analyzeEndpoints()
    
    // Generate comprehensive documentation
    const documentation = this.buildDocumentation()
    
    // Generate multiple output formats
    await this.generateMarkdownDocs(documentation)
    await this.generateOpenAPISpec(documentation)
    await this.generatePostmanCollection(documentation)
    
    console.log('\n✅ API documentation generation completed!')
  }
  
  private async scanAPIRoutes(): Promise<void> {
    const apiDir = path.join(process.cwd(), 'app', 'api')
    
    if (!fs.existsSync(apiDir)) {
      console.log('❌ API directory not found')
      return
    }
    
    this.apiRoutes = []
    this.scanDirectory(apiDir, '')
    
    console.log(`📊 Found ${this.apiRoutes.length} API route files`)
  }
  
  private scanDirectory(dir: string, basePath: string): void {
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        // Skip certain directories
        if (item === 'node_modules' || item === '.next') continue
        
        this.scanDirectory(fullPath, `${basePath}/${item}`)
      } else if (item === 'route.ts' || item === 'route.js') {
        // Found an API route
        const routePath = basePath || '/'
        this.apiRoutes.push(routePath)
      }
    }
  }
  
  private async analyzeEndpoints(): Promise<void> {
    console.log('🔍 Analyzing API endpoints...')
    
    // Define all known endpoints based on the project structure
    const knownEndpoints: APIEndpoint[] = [
      // Health and System
      {
        path: '/api/health',
        method: 'GET',
        description: 'System health check endpoint',
        category: 'System',
        authentication: 'none',
        roles: [],
        responses: {
          '200': {
            description: 'System is healthy',
            example: { status: 'healthy', timestamp: '2025-09-03T16:00:00Z' }
          }
        }
      },
      
      // Authentication
      {
        path: '/api/auth/google',
        method: 'GET',
        description: 'Initialize Google OAuth authentication',
        category: 'Authentication',
        authentication: 'none',
        roles: [],
        responses: {
          '302': {
            description: 'Redirect to Google OAuth',
            schema: 'Redirect response'
          }
        }
      },
      {
        path: '/api/auth/callback',
        method: 'GET', 
        description: 'Handle OAuth callback from Google',
        category: 'Authentication',
        authentication: 'none',
        roles: [],
        parameters: {
          query: {
            code: 'string',
            state: 'string'
          }
        },
        responses: {
          '302': {
            description: 'Redirect after successful authentication',
            schema: 'Redirect response'
          },
          '400': {
            description: 'Authentication failed',
            example: { error: 'Invalid authorization code' }
          }
        }
      },
      
      // User Management
      {
        path: '/api/admin/users',
        method: 'GET',
        description: 'Get all users with pagination and filtering',
        category: 'User Management',
        authentication: 'required',
        roles: ['admin', 'office_member'],
        parameters: {
          query: {
            page: 'number',
            limit: 'number',
            search: 'string',
            role: 'string'
          }
        },
        responses: {
          '200': {
            description: 'List of users',
            example: {
              users: [
                {
                  id: 'user_123',
                  email: 'user@example.com',
                  displayName: 'John Doe',
                  roles: ['viewer']
                }
              ],
              pagination: { page: 1, limit: 20, total: 100 }
            }
          }
        }
      },
      {
        path: '/api/admin/users',
        method: 'POST',
        description: 'Create a new user',
        category: 'User Management', 
        authentication: 'required',
        roles: ['admin'],
        parameters: {
          body: {
            email: 'string (required)',
            displayName: 'string (required)',
            role: 'string (optional)'
          }
        },
        responses: {
          '201': {
            description: 'User created successfully',
            example: {
              success: true,
              user: {
                id: 'user_124',
                email: 'newuser@example.com',
                displayName: 'Jane Doe'
              }
            }
          }
        }
      },
      {
        path: '/api/admin/users/[id]',
        method: 'GET',
        description: 'Get user by ID',
        category: 'User Management',
        authentication: 'required',
        roles: ['admin', 'office_member'],
        parameters: {
          path: { id: 'string' }
        },
        responses: {
          '200': { description: 'User details' },
          '404': { description: 'User not found' }
        }
      },
      {
        path: '/api/admin/users/[id]',
        method: 'PUT',
        description: 'Update user information',
        category: 'User Management',
        authentication: 'required',
        roles: ['admin'],
        parameters: {
          path: { id: 'string' },
          body: {
            displayName: 'string (optional)',
            email: 'string (optional)'
          }
        },
        responses: {
          '200': { description: 'User updated successfully' },
          '404': { description: 'User not found' }
        }
      },
      {
        path: '/api/admin/users/[id]',
        method: 'DELETE',
        description: 'Delete user',
        category: 'User Management',
        authentication: 'required',
        roles: ['admin'],
        parameters: {
          path: { id: 'string' }
        },
        responses: {
          '200': { description: 'User deleted successfully' },
          '404': { description: 'User not found' }
        }
      },
      
      // Permission Management
      {
        path: '/api/admin/users/[id]/upgrade-request',
        method: 'POST',
        description: 'Request permission upgrade for user',
        category: 'Permission Management',
        authentication: 'required',
        roles: ['viewer'],
        parameters: {
          path: { id: 'string' },
          body: {
            requestedRole: 'string',
            justification: 'string'
          }
        },
        responses: {
          '201': { description: 'Upgrade request created' }
        }
      },
      {
        path: '/api/admin/upgrade-requests',
        method: 'GET',
        description: 'Get all permission upgrade requests',
        category: 'Permission Management',
        authentication: 'required',
        roles: ['admin', 'office_member'],
        responses: {
          '200': { description: 'List of upgrade requests' }
        }
      },
      
      // Announcements
      {
        path: '/api/announcements',
        method: 'GET',
        description: 'Get published announcements',
        category: 'Announcements',
        authentication: 'optional',
        roles: [],
        parameters: {
          query: {
            page: 'number',
            limit: 'number'
          }
        },
        responses: {
          '200': { description: 'List of announcements' }
        }
      },
      {
        path: '/api/admin/announcements',
        method: 'GET',
        description: 'Get all announcements (including drafts)',
        category: 'Announcements',
        authentication: 'required',
        roles: ['admin', 'office_member'],
        responses: {
          '200': { description: 'List of all announcements' }
        }
      },
      {
        path: '/api/admin/announcements',
        method: 'POST',
        description: 'Create new announcement',
        category: 'Announcements',
        authentication: 'required',
        roles: ['admin', 'office_member'],
        parameters: {
          body: {
            title: 'string (required)',
            content: 'string (required)',
            isPublished: 'boolean (optional)'
          }
        },
        responses: {
          '201': { description: 'Announcement created' }
        }
      },
      
      // Events
      {
        path: '/api/events',
        method: 'GET',
        description: 'Get published events',
        category: 'Events',
        authentication: 'optional',
        roles: [],
        responses: {
          '200': { description: 'List of events' }
        }
      },
      {
        path: '/api/admin/events',
        method: 'GET',
        description: 'Get all events (admin view)',
        category: 'Events',
        authentication: 'required',
        roles: ['admin', 'office_member'],
        responses: {
          '200': { description: 'List of all events' }
        }
      },
      {
        path: '/api/admin/events',
        method: 'POST',
        description: 'Create new event',
        category: 'Events',
        authentication: 'required',
        roles: ['admin', 'office_member'],
        parameters: {
          body: {
            title: 'string (required)',
            description: 'string (required)',
            startDate: 'string (ISO date)',
            endDate: 'string (ISO date)',
            location: 'string (optional)'
          }
        },
        responses: {
          '201': { description: 'Event created' }
        }
      },
      {
        path: '/api/events/[id]/register',
        method: 'POST',
        description: 'Register for an event',
        category: 'Events',
        authentication: 'required',
        roles: ['admin', 'office_member', 'viewer'],
        parameters: {
          path: { id: 'string' }
        },
        responses: {
          '201': { description: 'Registration successful' },
          '409': { description: 'Already registered' }
        }
      },
      
      // Resources
      {
        path: '/api/resources',
        method: 'GET',
        description: 'Get published resources',
        category: 'Resources',
        authentication: 'optional',
        roles: [],
        parameters: {
          query: {
            category: 'string',
            gradeLevel: 'string',
            search: 'string'
          }
        },
        responses: {
          '200': { description: 'List of resources' }
        }
      },
      {
        path: '/api/admin/resources',
        method: 'GET',
        description: 'Get all resources (admin view)',
        category: 'Resources',
        authentication: 'required',
        roles: ['admin', 'office_member'],
        responses: {
          '200': { description: 'List of all resources' }
        }
      },
      {
        path: '/api/admin/resources',
        method: 'POST',
        description: 'Create new resource',
        category: 'Resources',
        authentication: 'required',
        roles: ['admin', 'office_member'],
        parameters: {
          body: {
            title: 'string (required)',
            description: 'string (required)',
            categoryId: 'string (required)',
            gradeLevelId: 'string (optional)',
            fileUrl: 'string (optional)'
          }
        },
        responses: {
          '201': { description: 'Resource created' }
        }
      },
      {
        path: '/api/admin/resources/analytics',
        method: 'GET',
        description: 'Get resource analytics and statistics',
        category: 'Resources',
        authentication: 'required',
        roles: ['admin', 'office_member'],
        responses: {
          '200': { description: 'Resource analytics data' }
        }
      },
      
      // Notifications
      {
        path: '/api/notifications',
        method: 'GET',
        description: 'Get user notifications',
        category: 'Notifications',
        authentication: 'required',
        roles: ['admin', 'office_member', 'viewer'],
        responses: {
          '200': { description: 'List of notifications' }
        }
      },
      {
        path: '/api/notifications/stream',
        method: 'GET',
        description: 'Real-time notification stream (SSE)',
        category: 'Notifications',
        authentication: 'required',
        roles: ['admin', 'office_member', 'viewer'],
        responses: {
          '200': { description: 'Server-sent events stream' }
        }
      },
      {
        path: '/api/notifications/stats',
        method: 'GET',
        description: 'Get notification statistics',
        category: 'Notifications',
        authentication: 'required',
        roles: ['admin', 'office_member'],
        responses: {
          '200': { description: 'Notification statistics' }
        }
      }
    ]
    
    this.endpoints = knownEndpoints
    console.log(`📊 Analyzed ${this.endpoints.length} API endpoints`)
  }
  
  private setupSchemas(): void {
    this.schemas = {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique user identifier' },
          email: { type: 'string', format: 'email', description: 'User email address' },
          displayName: { type: 'string', description: 'User display name' },
          createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
        },
        required: ['id', 'email', 'displayName']
      },
      
      Announcement: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique announcement identifier' },
          title: { type: 'string', description: 'Announcement title' },
          content: { type: 'string', description: 'Announcement content' },
          isPublished: { type: 'boolean', description: 'Publication status' },
          createdBy: { type: 'string', description: 'Creator user ID' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'title', 'content', 'createdBy']
      },
      
      Event: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique event identifier' },
          title: { type: 'string', description: 'Event title' },
          description: { type: 'string', description: 'Event description' },
          startDate: { type: 'string', format: 'date-time', description: 'Event start time' },
          endDate: { type: 'string', format: 'date-time', description: 'Event end time' },
          location: { type: 'string', description: 'Event location' },
          createdBy: { type: 'string', description: 'Creator user ID' },
          createdAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'title', 'startDate', 'createdBy']
      },
      
      Resource: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique resource identifier' },
          title: { type: 'string', description: 'Resource title' },
          description: { type: 'string', description: 'Resource description' },
          fileUrl: { type: 'string', description: 'Resource file URL' },
          categoryId: { type: 'string', description: 'Resource category ID' },
          gradeLevelId: { type: 'string', description: 'Grade level ID' },
          isPublished: { type: 'boolean', description: 'Publication status' },
          createdBy: { type: 'string', description: 'Creator user ID' },
          createdAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'title', 'categoryId', 'createdBy']
      },
      
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique notification identifier' },
          recipientId: { type: 'string', description: 'Recipient user ID' },
          title: { type: 'string', description: 'Notification title' },
          message: { type: 'string', description: 'Notification message' },
          type: { type: 'string', enum: ['info', 'warning', 'error', 'success'] },
          isRead: { type: 'boolean', description: 'Read status' },
          createdAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'recipientId', 'title', 'message', 'type']
      },
      
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', description: 'Error message' },
          code: { type: 'string', description: 'Error code' },
          timestamp: { type: 'string', format: 'date-time' }
        },
        required: ['success', 'error']
      },
      
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object', description: 'Response data' },
          timestamp: { type: 'string', format: 'date-time' }
        },
        required: ['success']
      },
      
      PaginatedResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { type: 'object' } },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'number', description: 'Current page number' },
              limit: { type: 'number', description: 'Items per page' },
              total: { type: 'number', description: 'Total number of items' },
              pages: { type: 'number', description: 'Total number of pages' }
            }
          }
        }
      }
    }
  }
  
  private buildDocumentation(): APIDocumentation {
    return {
      info: {
        title: 'KCISLK ESID Info Hub API',
        version: '1.0.0',
        description: 'Comprehensive API for KCISLK Elementary School International Department Information Hub',
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      },
      authentication: {
        type: 'Bearer Token (JWT)',
        description: 'Authentication using Google OAuth 2.0 with JWT tokens. Include the token in the Authorization header: `Bearer <token>`'
      },
      endpoints: this.endpoints,
      schemas: this.schemas
    }
  }
  
  private async generateMarkdownDocs(doc: APIDocumentation): Promise<void> {
    console.log('📝 Generating Markdown documentation...')
    
    const markdown = this.generateMarkdownContent(doc)
    const outputPath = path.join(process.cwd(), 'docs', 'API-DOCUMENTATION.md')
    
    // Ensure docs directory exists
    const docsDir = path.dirname(outputPath)
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true })
    }
    
    fs.writeFileSync(outputPath, markdown)
    console.log(`   ✅ Markdown docs saved to: ${outputPath}`)
  }
  
  private generateMarkdownContent(doc: APIDocumentation): string {
    const categories = Array.from(new Set(doc.endpoints.map(e => e.category)))
    
    let markdown = `# ${doc.info.title} - API Documentation

> **Version**: ${doc.info.version}  
> **Base URL**: ${doc.info.baseUrl}  
> **Generated**: ${new Date().toISOString()}

## Overview

${doc.info.description}

This documentation covers all ${doc.endpoints.length} API endpoints across ${categories.length} categories, providing comprehensive information for developers integrating with the KCISLK ESID Info Hub system.

## Authentication

**${doc.authentication.type}**

${doc.authentication.description}

### Example Authentication Header
\`\`\`
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

## API Endpoints

### Quick Reference

| Category | Endpoints | Authentication |
|----------|-----------|----------------|
`

    // Generate category summary
    categories.forEach(category => {
      const categoryEndpoints = doc.endpoints.filter(e => e.category === category)
      const authRequired = categoryEndpoints.some(e => e.authentication === 'required')
      markdown += `| ${category} | ${categoryEndpoints.length} | ${authRequired ? '✅ Required' : '❌ Optional/None'} |\n`
    })
    
    markdown += `\n`
    
    // Generate detailed documentation for each category
    categories.forEach(category => {
      markdown += `\n## ${category}\n\n`
      
      const categoryEndpoints = doc.endpoints.filter(e => e.category === category)
      
      categoryEndpoints.forEach(endpoint => {
        markdown += `### ${endpoint.method.toUpperCase()} ${endpoint.path}\n\n`
        markdown += `${endpoint.description}\n\n`
        
        // Authentication
        if (endpoint.authentication === 'required') {
          markdown += `**🔒 Authentication Required** - Roles: ${endpoint.roles.join(', ')}\n\n`
        } else if (endpoint.authentication === 'optional') {
          markdown += `**🔓 Authentication Optional**\n\n`
        } else {
          markdown += `**🌐 Public Endpoint**\n\n`
        }
        
        // Parameters
        if (endpoint.parameters) {
          if (endpoint.parameters.path) {
            markdown += `**Path Parameters:**\n\n`
            Object.entries(endpoint.parameters.path).forEach(([name, type]) => {
              markdown += `- \`${name}\` (${type})\n`
            })
            markdown += `\n`
          }
          
          if (endpoint.parameters.query) {
            markdown += `**Query Parameters:**\n\n`
            Object.entries(endpoint.parameters.query).forEach(([name, type]) => {
              markdown += `- \`${name}\` (${type})\n`
            })
            markdown += `\n`
          }
          
          if (endpoint.parameters.body) {
            markdown += `**Request Body:**\n\n`
            markdown += `\`\`\`json\n`
            markdown += JSON.stringify(endpoint.parameters.body, null, 2)
            markdown += `\n\`\`\`\n\n`
          }
        }
        
        // Responses
        markdown += `**Responses:**\n\n`
        Object.entries(endpoint.responses).forEach(([status, response]) => {
          markdown += `- \`${status}\`: ${response.description}\n`
          if (response.example) {
            markdown += `  \`\`\`json\n  ${JSON.stringify(response.example, null, 2)}\n  \`\`\`\n`
          }
        })
        markdown += `\n`
        
        // Examples
        if (endpoint.examples) {
          markdown += `**Example Usage:**\n\n`
          markdown += `\`\`\`bash\n`
          markdown += `curl -X ${endpoint.method.toUpperCase()} \\\n`
          markdown += `  "${doc.info.baseUrl}${endpoint.path}" \\\n`
          if (endpoint.authentication === 'required') {
            markdown += `  -H "Authorization: Bearer <your-token>" \\\n`
          }
          markdown += `  -H "Content-Type: application/json"\n`
          if (endpoint.examples.request) {
            markdown += `  -d '${JSON.stringify(endpoint.examples.request)}'\n`
          }
          markdown += `\`\`\`\n\n`
        }
        
        markdown += `---\n\n`
      })
    })
    
    // Add schemas
    markdown += `\n## Data Schemas\n\n`
    Object.entries(doc.schemas).forEach(([name, schema]) => {
      markdown += `### ${name}\n\n`
      if (schema.properties) {
        markdown += `| Field | Type | Required | Description |\n`
        markdown += `|-------|------|----------|-------------|\n`
        Object.entries(schema.properties).forEach(([field, prop]: [string, any]) => {
          const required = schema.required?.includes(field) ? '✅' : '❌'
          markdown += `| \`${field}\` | ${prop.type} | ${required} | ${prop.description || ''} |\n`
        })
      }
      markdown += `\n`
    })
    
    // Add footer
    markdown += `\n## Support and Development\n\n`
    markdown += `- **Health Check**: \`GET /api/health\`\n`
    markdown += `- **Version**: ${doc.info.version}\n`
    markdown += `- **Last Updated**: ${new Date().toISOString()}\n`
    markdown += `\n`
    markdown += `For technical support or questions about this API, please contact the development team.\n`
    
    return markdown
  }
  
  private async generateOpenAPISpec(doc: APIDocumentation): Promise<void> {
    console.log('🔧 Generating OpenAPI/Swagger specification...')
    
    const openApiSpec = {
      openapi: '3.0.0',
      info: {
        title: doc.info.title,
        version: doc.info.version,
        description: doc.info.description
      },
      servers: [
        {
          url: doc.info.baseUrl,
          description: 'Main server'
        }
      ],
      security: [
        {
          bearerAuth: []
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: doc.schemas
      },
      paths: this.generateOpenAPIPaths(doc.endpoints)
    }
    
    const outputPath = path.join(process.cwd(), 'docs', 'api-spec.json')
    fs.writeFileSync(outputPath, JSON.stringify(openApiSpec, null, 2))
    
    console.log(`   ✅ OpenAPI spec saved to: ${outputPath}`)
  }
  
  private generateOpenAPIPaths(endpoints: APIEndpoint[]): any {
    const paths: any = {}
    
    endpoints.forEach(endpoint => {
      if (!paths[endpoint.path]) {
        paths[endpoint.path] = {}
      }
      
      const method = endpoint.method.toLowerCase()
      paths[endpoint.path][method] = {
        summary: endpoint.description,
        tags: [endpoint.category],
        security: endpoint.authentication === 'required' ? [{ bearerAuth: [] }] : [],
        parameters: this.generateOpenAPIParameters(endpoint.parameters),
        requestBody: this.generateOpenAPIRequestBody(endpoint.parameters?.body),
        responses: this.generateOpenAPIResponses(endpoint.responses)
      }
    })
    
    return paths
  }
  
  private generateOpenAPIParameters(parameters?: any): any[] {
    const params: any[] = []
    
    if (parameters?.path) {
      Object.entries(parameters.path).forEach(([name, type]) => {
        params.push({
          name,
          in: 'path',
          required: true,
          schema: { type: type === 'string' ? 'string' : 'number' }
        })
      })
    }
    
    if (parameters?.query) {
      Object.entries(parameters.query).forEach(([name, type]) => {
        params.push({
          name,
          in: 'query',
          required: false,
          schema: { type: type === 'string' ? 'string' : 'number' }
        })
      })
    }
    
    return params
  }
  
  private generateOpenAPIRequestBody(bodyParams?: any): any {
    if (!bodyParams) return undefined
    
    return {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: this.convertToOpenAPIProperties(bodyParams)
          }
        }
      }
    }
  }
  
  private generateOpenAPIResponses(responses: any): any {
    const openApiResponses: any = {}
    
    Object.entries(responses).forEach(([status, response]: [string, any]) => {
      openApiResponses[status] = {
        description: response.description,
        content: response.example ? {
          'application/json': {
            example: response.example
          }
        } : undefined
      }
    })
    
    return openApiResponses
  }
  
  private convertToOpenAPIProperties(params: any): any {
    const properties: any = {}
    
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const isRequired = value.includes('required')
        properties[key] = {
          type: 'string',
          description: value
        }
      }
    })
    
    return properties
  }
  
  private async generatePostmanCollection(doc: APIDocumentation): Promise<void> {
    console.log('📮 Generating Postman collection...')
    
    const collection = {
      info: {
        name: doc.info.title,
        version: doc.info.version,
        description: doc.info.description,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      auth: {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{jwt_token}}',
            type: 'string'
          }
        ]
      },
      variable: [
        {
          key: 'base_url',
          value: doc.info.baseUrl,
          type: 'string'
        },
        {
          key: 'jwt_token',
          value: 'your-jwt-token-here',
          type: 'string'
        }
      ],
      item: this.generatePostmanItems(doc.endpoints)
    }
    
    const outputPath = path.join(process.cwd(), 'docs', 'postman-collection.json')
    fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2))
    
    console.log(`   ✅ Postman collection saved to: ${outputPath}`)
  }
  
  private generatePostmanItems(endpoints: APIEndpoint[]): any[] {
    const categories = Array.from(new Set(endpoints.map(e => e.category)))
    
    return categories.map(category => ({
      name: category,
      item: endpoints
        .filter(e => e.category === category)
        .map(endpoint => ({
          name: `${endpoint.method.toUpperCase()} ${endpoint.path}`,
          request: {
            method: endpoint.method.toUpperCase(),
            header: [
              {
                key: 'Content-Type',
                value: 'application/json',
                type: 'text'
              }
            ],
            auth: endpoint.authentication === 'required' ? {
              type: 'bearer',
              bearer: [
                {
                  key: 'token',
                  value: '{{jwt_token}}',
                  type: 'string'
                }
              ]
            } : undefined,
            url: {
              raw: `{{base_url}}${endpoint.path}`,
              host: ['{{base_url}}'],
              path: endpoint.path.split('/').filter(p => p)
            },
            body: endpoint.parameters?.body ? {
              mode: 'raw',
              raw: JSON.stringify(endpoint.parameters.body, null, 2),
              options: {
                raw: {
                  language: 'json'
                }
              }
            } : undefined
          },
          response: Object.entries(endpoint.responses).map(([status, response]: [string, any]) => ({
            name: `${status} - ${response.description}`,
            originalRequest: {
              method: endpoint.method.toUpperCase(),
              url: `{{base_url}}${endpoint.path}`
            },
            status: response.description,
            code: parseInt(status),
            header: [
              {
                key: 'Content-Type',
                value: 'application/json'
              }
            ],
            body: response.example ? JSON.stringify(response.example, null, 2) : ''
          }))
        }))
    }))
  }
}

// Main execution
async function main() {
  const generator = new APIDocumentationGenerator()
  
  try {
    await generator.generateDocumentation()
  } catch (error) {
    console.error('❌ API documentation generation failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Documentation generation failed:', error)
    process.exit(1)
  })
}

export { APIDocumentationGenerator }