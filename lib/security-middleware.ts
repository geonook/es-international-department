/**
 * Security Middleware
 * 安全中介軟體 - 綜合安全防護
 * 
 * Provides comprehensive security features including:
 * - Rate limiting
 * - CORS protection
 * - XSS protection
 * - CSRF protection  
 * - Input validation
 * - Security headers
 */

import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, withPerformanceMonitoring } from './performance-middleware'

// Security configuration
const SECURITY_CONFIG = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // requests per window
    skipSuccessfulRequests: true,
    skipFailedRequests: false
  },
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://landing-app-v2.zeabur.app',
      process.env.NEXT_PUBLIC_APP_URL
    ].filter(Boolean),
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control'
    ],
    maxAge: 86400 // 24 hours
  },
  security: {
    enableHSTS: true,
    enableXSSProtection: true,
    enableFrameOptions: true,
    enableContentTypeOptions: true,
    enableReferrerPolicy: true
  }
}

/**
 * CORS protection middleware
 */
export function withCORSProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const origin = request.headers.get('origin')
    const method = request.method
    
    // Handle preflight requests
    if (method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 })
      
      // Set CORS headers for preflight
      if (origin && SECURITY_CONFIG.cors.allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin)
      }
      
      response.headers.set('Access-Control-Allow-Methods', SECURITY_CONFIG.cors.allowedMethods.join(', '))
      response.headers.set('Access-Control-Allow-Headers', SECURITY_CONFIG.cors.allowedHeaders.join(', '))
      response.headers.set('Access-Control-Max-Age', SECURITY_CONFIG.cors.maxAge.toString())
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      
      return response
    }
    
    // Execute the handler
    const response = await handler(request)
    
    // Set CORS headers for actual requests
    if (origin && SECURITY_CONFIG.cors.allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    
    return response
  }
}

/**
 * Security headers middleware
 */
export function withSecurityHeaders(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await handler(request)
    
    const headers = new Headers(response.headers)
    
    // HSTS (HTTP Strict Transport Security)
    if (SECURITY_CONFIG.security.enableHSTS && process.env.NODE_ENV === 'production') {
      headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    }
    
    // XSS Protection
    if (SECURITY_CONFIG.security.enableXSSProtection) {
      headers.set('X-XSS-Protection', '1; mode=block')
      headers.set('X-Content-Type-Options', 'nosniff')
    }
    
    // Frame Options (prevent clickjacking)
    if (SECURITY_CONFIG.security.enableFrameOptions) {
      headers.set('X-Frame-Options', 'DENY')
      headers.set('Content-Security-Policy', "frame-ancestors 'none'")
    }
    
    // Content Type Options
    if (SECURITY_CONFIG.security.enableContentTypeOptions) {
      headers.set('X-Content-Type-Options', 'nosniff')
    }
    
    // Referrer Policy
    if (SECURITY_CONFIG.security.enableReferrerPolicy) {
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    }
    
    // Additional security headers
    headers.set('X-DNS-Prefetch-Control', 'off')
    headers.set('X-Download-Options', 'noopen')
    headers.set('X-Permitted-Cross-Domain-Policies', 'none')
    
    // Content Security Policy (CSP)
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tiny.cloud",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' data: blob:",
      "connect-src 'self' https://api.zeabur.com https://*.googleapis.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ')
    
    headers.set('Content-Security-Policy', csp)
    
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    })
  }
}

/**
 * Input validation middleware
 */
export function withInputValidation(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    maxBodySize?: number
    allowedContentTypes?: string[]
    validateJSON?: boolean
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const {
      maxBodySize = 10 * 1024 * 1024, // 10MB default
      allowedContentTypes = ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded'],
      validateJSON = true
    } = options
    
    try {
      // Check Content-Type for POST/PUT requests
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const contentType = request.headers.get('content-type')
        
        if (contentType) {
          const isAllowed = allowedContentTypes.some(allowed => 
            contentType.toLowerCase().includes(allowed.toLowerCase())
          )
          
          if (!isAllowed) {
            return NextResponse.json(
              { 
                success: false, 
                error: 'Invalid content type',
                message: 'Content-Type not allowed'
              },
              { status: 415 }
            )
          }
        }
        
        // Check body size
        const contentLength = request.headers.get('content-length')
        if (contentLength && parseInt(contentLength) > maxBodySize) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Payload too large',
              message: `Request body exceeds maximum size of ${maxBodySize} bytes`
            },
            { status: 413 }
          )
        }
        
        // Validate JSON for JSON requests
        if (validateJSON && contentType?.includes('application/json')) {
          try {
            const clone = request.clone()
            const body = await clone.text()
            
            if (body) {
              JSON.parse(body) // This will throw if invalid JSON
            }
          } catch (jsonError) {
            return NextResponse.json(
              { 
                success: false, 
                error: 'Invalid JSON',
                message: 'Request body contains invalid JSON'
              },
              { status: 400 }
            )
          }
        }
      }
      
      return await handler(request)
      
    } catch (error) {
      console.error('Input validation error:', error)
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          message: 'Request validation failed'
        },
        { status: 400 }
      )
    }
  }
}

/**
 * CSRF protection middleware  
 */
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Skip CSRF check for GET requests and same-origin requests
    if (request.method === 'GET' || request.method === 'HEAD') {
      return await handler(request)
    }
    
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const host = request.headers.get('host')
    
    // Check if request is from same origin
    const allowedOrigins = SECURITY_CONFIG.cors.allowedOrigins
    const isValidOrigin = origin && allowedOrigins.includes(origin)
    const isValidReferer = referer && allowedOrigins.some(allowed => referer.startsWith(allowed))
    
    if (!isValidOrigin && !isValidReferer) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'CSRF validation failed',
          message: 'Invalid origin or referer'
        },
        { status: 403 }
      )
    }
    
    return await handler(request)
  }
}

/**
 * API key validation middleware
 */
export function withAPIKeyValidation(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    headerName?: string
    skipForAuthenticated?: boolean
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { 
      headerName = 'x-api-key',
      skipForAuthenticated = true 
    } = options
    
    // Skip API key check if user is already authenticated
    if (skipForAuthenticated && request.headers.get('authorization')) {
      return await handler(request)
    }
    
    const apiKey = request.headers.get(headerName)
    const validApiKeys = [
      process.env.API_KEY,
      process.env.INTERNAL_API_KEY
    ].filter(Boolean)
    
    if (!apiKey || !validApiKeys.includes(apiKey)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid API key',
          message: 'Valid API key required'
        },
        { status: 401 }
      )
    }
    
    return await handler(request)
  }
}

/**
 * Comprehensive security middleware
 */
export function withSecurityProtection(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    enableRateLimit?: boolean
    enableCORS?: boolean
    enableCSRF?: boolean
    enableInputValidation?: boolean
    enableAPIKey?: boolean
    rateLimitConfig?: any
    inputValidationConfig?: any
    apiKeyConfig?: any
  } = {}
) {
  let protectedHandler = handler
  
  // Apply input validation
  if (options.enableInputValidation !== false) {
    protectedHandler = withInputValidation(protectedHandler, options.inputValidationConfig)
  }
  
  // Apply CSRF protection
  if (options.enableCSRF !== false) {
    protectedHandler = withCSRFProtection(protectedHandler)
  }
  
  // Apply CORS protection
  if (options.enableCORS !== false) {
    protectedHandler = withCORSProtection(protectedHandler)
  }
  
  // Apply API key validation if enabled
  if (options.enableAPIKey) {
    protectedHandler = withAPIKeyValidation(protectedHandler, options.apiKeyConfig)
  }
  
  // Apply rate limiting
  if (options.enableRateLimit !== false) {
    protectedHandler = withRateLimit(protectedHandler, {
      maxRequests: SECURITY_CONFIG.rateLimit.maxRequests,
      windowMs: SECURITY_CONFIG.rateLimit.windowMs,
      ...options.rateLimitConfig
    })
  }
  
  // Apply security headers
  protectedHandler = withSecurityHeaders(protectedHandler)
  
  // Apply performance monitoring
  protectedHandler = withPerformanceMonitoring(protectedHandler)
  
  return protectedHandler
}

// Export individual middleware functions
export {
  withCORSProtection,
  withSecurityHeaders,
  withInputValidation,
  withCSRFProtection,
  withAPIKeyValidation
}

// Export security configuration
export { SECURITY_CONFIG }