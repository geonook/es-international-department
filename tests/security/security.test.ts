/**
 * Security Tests
 * 安全性測試
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  withSecurityProtection,
  withInputValidation,
  withCSRFProtection,
  withCORSProtection
} from '@/lib/security-middleware'
import { sanitizeHtml, validateHtmlContent } from '@/lib/html-sanitizer'

describe('Security Middleware', () => {
  
  describe('Input Validation', () => {
    const mockHandler = jest.fn().mockResolvedValue(
      NextResponse.json({ success: true })
    )
    
    beforeEach(() => {
      mockHandler.mockClear()
    })
    
    test('should reject requests with invalid content type', async () => {
      const protectedHandler = withInputValidation(mockHandler, {
        allowedContentTypes: ['application/json']
      })
      
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'content-type': 'text/plain'
        },
        body: 'plain text body'
      })
      
      const response = await protectedHandler(request)
      const data = await response.json()
      
      expect(response.status).toBe(415)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid content type')
      expect(mockHandler).not.toHaveBeenCalled()
    })
    
    test('should reject requests with body too large', async () => {
      const protectedHandler = withInputValidation(mockHandler, {
        maxBodySize: 100 // Very small limit for testing
      })
      
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': '1000'
        }
      })
      
      const response = await protectedHandler(request)
      const data = await response.json()
      
      expect(response.status).toBe(413)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Payload too large')
      expect(mockHandler).not.toHaveBeenCalled()
    })
    
    test('should reject requests with invalid JSON', async () => {
      const protectedHandler = withInputValidation(mockHandler)
      
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: '{ invalid json'
      })
      
      const response = await protectedHandler(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid JSON')
      expect(mockHandler).not.toHaveBeenCalled()
    })
    
    test('should allow valid requests', async () => {
      const protectedHandler = withInputValidation(mockHandler)
      
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ valid: 'data' })
      })
      
      const response = await protectedHandler(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockHandler).toHaveBeenCalledWith(request)
    })
  })
  
  describe('CSRF Protection', () => {
    const mockHandler = jest.fn().mockResolvedValue(
      NextResponse.json({ success: true })
    )
    
    beforeEach(() => {
      mockHandler.mockClear()
    })
    
    test('should allow GET requests without CSRF check', async () => {
      const protectedHandler = withCSRFProtection(mockHandler)
      
      const request = new NextRequest('http://localhost/api/test', {
        method: 'GET'
      })
      
      const response = await protectedHandler(request)
      
      expect(response.status).toBe(200)
      expect(mockHandler).toHaveBeenCalled()
    })
    
    test('should reject POST requests without valid origin', async () => {
      const protectedHandler = withCSRFProtection(mockHandler)
      
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'origin': 'http://malicious-site.com'
        }
      })
      
      const response = await protectedHandler(request)
      const data = await response.json()
      
      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error).toBe('CSRF validation failed')
      expect(mockHandler).not.toHaveBeenCalled()
    })
    
    test('should allow POST requests with valid origin', async () => {
      const protectedHandler = withCSRFProtection(mockHandler)
      
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'origin': 'http://localhost:3001'
        }
      })
      
      const response = await protectedHandler(request)
      
      expect(response.status).toBe(200)
      expect(mockHandler).toHaveBeenCalled()
    })
  })
  
  describe('CORS Protection', () => {
    const mockHandler = jest.fn().mockResolvedValue(
      NextResponse.json({ success: true })
    )
    
    beforeEach(() => {
      mockHandler.mockClear()
    })
    
    test('should handle OPTIONS preflight requests', async () => {
      const protectedHandler = withCORSProtection(mockHandler)
      
      const request = new NextRequest('http://localhost/api/test', {
        method: 'OPTIONS',
        headers: {
          'origin': 'http://localhost:3001'
        }
      })
      
      const response = await protectedHandler(request)
      
      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3001')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
      expect(mockHandler).not.toHaveBeenCalled()
    })
    
    test('should add CORS headers to responses', async () => {
      const protectedHandler = withCORSProtection(mockHandler)
      
      const request = new NextRequest('http://localhost/api/test', {
        method: 'GET',
        headers: {
          'origin': 'http://localhost:3001'
        }
      })
      
      const response = await protectedHandler(request)
      
      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3001')
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true')
      expect(mockHandler).toHaveBeenCalled()
    })
  })
  
  describe('Comprehensive Security Protection', () => {
    const mockHandler = jest.fn().mockResolvedValue(
      NextResponse.json({ success: true })
    )
    
    beforeEach(() => {
      mockHandler.mockClear()
    })
    
    test('should apply all security measures', async () => {
      const protectedHandler = withSecurityProtection(mockHandler, {
        enableRateLimit: false, // Disable for testing
        enableCORS: true,
        enableCSRF: true,
        enableInputValidation: true
      })
      
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'origin': 'http://localhost:3001'
        },
        body: JSON.stringify({ test: 'data' })
      })
      
      const response = await protectedHandler(request)
      
      expect(response.status).toBe(200)
      
      // Check security headers
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block')
      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('Content-Security-Policy')).toBeDefined()
      
      expect(mockHandler).toHaveBeenCalled()
    })
  })
})

describe('HTML Sanitizer', () => {
  
  describe('XSS Prevention', () => {
    test('should remove script tags', () => {
      const maliciousHtml = '<p>Hello</p><script>alert("xss")</script>'
      const sanitized = sanitizeHtml(maliciousHtml)
      
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('alert')
      expect(sanitized).toContain('<p>Hello</p>')
    })
    
    test('should remove event handlers', () => {
      const maliciousHtml = '<button onclick="alert(\'xss\')">Click me</button>'
      const sanitized = sanitizeHtml(maliciousHtml)
      
      expect(sanitized).not.toContain('onclick')
      expect(sanitized).not.toContain('alert')
      expect(sanitized).toContain('<button>Click me</button>')
    })
    
    test('should remove javascript: protocol', () => {
      const maliciousHtml = '<a href="javascript:alert(\'xss\')">Link</a>'
      const sanitized = sanitizeHtml(maliciousHtml)
      
      expect(sanitized).not.toContain('javascript:')
      expect(sanitized).not.toContain('alert')
      expect(sanitized).toContain('<a href="">Link</a>')
    })
    
    test('should remove style tags', () => {
      const maliciousHtml = '<p>Hello</p><style>body{background:red}</style>'
      const sanitized = sanitizeHtml(maliciousHtml)
      
      expect(sanitized).not.toContain('<style>')
      expect(sanitized).not.toContain('background:red')
      expect(sanitized).toContain('<p>Hello</p>')
    })
    
    test('should allow safe HTML', () => {
      const safeHtml = '<h1>Title</h1><p>Paragraph with <strong>bold</strong> text.</p><ul><li>Item 1</li></ul>'
      const sanitized = sanitizeHtml(safeHtml)
      
      expect(sanitized).toContain('<h1>Title</h1>')
      expect(sanitized).toContain('<p>Paragraph with <strong>bold</strong> text.</p>')
      expect(sanitized).toContain('<ul><li>Item 1</li></ul>')
    })
    
    test('should handle empty and null input', () => {
      expect(sanitizeHtml('')).toBe('')
      expect(sanitizeHtml(null as any)).toBe('')
      expect(sanitizeHtml(undefined as any)).toBe('')
    })
    
    test('should respect length limits', () => {
      const longHtml = '<p>' + 'a'.repeat(60000) + '</p>'
      const sanitized = sanitizeHtml(longHtml, { maxLength: 1000 })
      
      expect(sanitized.length).toBeLessThanOrEqual(1000)
    })
  })
  
  describe('HTML Content Validation', () => {
    test('should validate required content', () => {
      const result = validateHtmlContent('', { required: true })
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('內容為必填項目')
    })
    
    test('should validate content length', () => {
      const longContent = '<p>' + 'a'.repeat(60000) + '</p>'
      const result = validateHtmlContent(longContent, { maxLength: 1000 })
      
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('內容長度不能超過')
    })
    
    test('should validate word count', () => {
      const content = '<p>' + 'word '.repeat(15000) + '</p>'
      const result = validateHtmlContent(content, { maxWordCount: 1000 })
      
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('內容字數不能超過')
    })
    
    test('should pass valid content', () => {
      const validContent = '<h1>Title</h1><p>Valid content here.</p>'
      const result = validateHtmlContent(validContent, { 
        required: true,
        maxLength: 10000,
        maxWordCount: 1000
      })
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})