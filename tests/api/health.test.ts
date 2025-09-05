/**
 * API Health Check Tests
 * API 健康檢查測試
 */

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/health/route'
import { TestAPIHelpers } from '../utils/test-helpers'

describe('API Health Check', () => {
  test('should return healthy status', async () => {
    const request = new NextRequest('http://localhost:3000/api/health', {
      method: 'GET',
    })
    
    const response = await GET()
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('timestamp')
    expect(data.status).toBe('healthy')
  })
  
  test('should include service status checks', async () => {
    const request = new NextRequest('http://localhost:3000/api/health', {
      method: 'GET',
    })
    
    const response = await GET()
    const data = await response.json()
    
    expect(data).toHaveProperty('services')
    expect(data.services).toHaveProperty('database')
    expect(data.services).toHaveProperty('application')
    
    // All services should be operational in test environment
    Object.values(data.services).forEach(service => {
      expect(service).toBe('operational')
    })
  })
  
  test('should respond quickly', async () => {
    const startTime = Date.now()
    const response = await GET()
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    expect(response.status).toBe(200)
    expect(responseTime).toBeLessThan(1000) // Should respond within 1 second
  })
  
  test('should include version information', async () => {
    const response = await GET()
    const data = await response.json()
    
    expect(data).toHaveProperty('version')
    expect(typeof data.version).toBe('string')
  })
  
  test('should include uptime information', async () => {
    const response = await GET()
    const data = await response.json()
    
    expect(data).toHaveProperty('uptime')
    expect(typeof data.uptime).toBe('number')
    expect(data.uptime).toBeGreaterThan(0)
  })
})