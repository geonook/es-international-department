/**
 * Basic Configuration Tests
 * 基礎配置測試
 * 
 * Tests to verify Jest and TypeScript setup is working correctly
 */

describe('Basic Configuration Tests', () => {
  describe('Environment Setup', () => {
    test('should have proper test environment', () => {
      expect(process.env.NODE_ENV).toBe('test')
    })

    test('should have JWT secret configured', () => {
      expect(process.env.JWT_SECRET).toBeDefined()
      expect(process.env.JWT_SECRET.length).toBeGreaterThan(10)
    })

    test('should have Google OAuth credentials configured', () => {
      expect(process.env.GOOGLE_CLIENT_ID).toBeDefined()
      expect(process.env.GOOGLE_CLIENT_SECRET).toBeDefined()
    })
  })

  describe('TypeScript Support', () => {
    test('should support TypeScript interfaces', () => {
      interface TestUser {
        id: string
        email: string
        isActive: boolean
      }
      
      const user: TestUser = {
        id: '1',
        email: 'test@example.com',
        isActive: true
      }
      
      expect(user.id).toBe('1')
      expect(user.email).toBe('test@example.com')
      expect(user.isActive).toBe(true)
    })

    test('should support async/await', async () => {
      const asyncFunction = async (value: string): Promise<string> => {
        return `processed-${value}`
      }
      
      const result = await asyncFunction('test')
      expect(result).toBe('processed-test')
    })

    test('should support generic types', () => {
      function identity<T>(arg: T): T {
        return arg
      }
      
      const stringResult = identity<string>('hello')
      const numberResult = identity<number>(42)
      
      expect(stringResult).toBe('hello')
      expect(numberResult).toBe(42)
    })
  })

  describe('Jest Features', () => {
    test('should support mock functions', () => {
      const mockFn = jest.fn()
      mockFn('test')
      
      expect(mockFn).toHaveBeenCalledWith('test')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('should support async mock functions', async () => {
      const asyncMock = jest.fn().mockResolvedValue('async result')
      
      const result = await asyncMock()
      expect(result).toBe('async result')
      expect(asyncMock).toHaveBeenCalledTimes(1)
    })

    test('should support basic string matching', () => {
      const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      const email = 'test@example.com'
      
      // Basic validation without custom matchers
      expect(jwtToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    })
  })

  describe('Mock Modules', () => {
    test('should be able to mock simple modules', () => {
      // Create a simple mock
      const mockModule = {
        testFunction: jest.fn().mockReturnValue('mocked result')
      }
      
      const result = mockModule.testFunction()
      expect(result).toBe('mocked result')
      expect(mockModule.testFunction).toHaveBeenCalledTimes(1)
    })

    test('should handle complex mock objects', () => {
      const mockPrismaUser = {
        findMany: jest.fn().mockResolvedValue([
          { id: '1', email: 'test1@example.com' },
          { id: '2', email: 'test2@example.com' }
        ]),
        create: jest.fn().mockResolvedValue({
          id: '3',
          email: 'test3@example.com'
        })
      }
      
      // Test the mock functions
      mockPrismaUser.findMany().then(users => {
        expect(users).toHaveLength(2)
        expect(users[0].email).toBe('test1@example.com')
      })
      
      mockPrismaUser.create({ data: { email: 'test3@example.com' } }).then(user => {
        expect(user.email).toBe('test3@example.com')
      })
    })
  })

  describe('Error Handling', () => {
    test('should handle thrown errors', () => {
      const errorFunction = () => {
        throw new Error('Test error')
      }
      
      expect(errorFunction).toThrow('Test error')
    })

    test('should handle rejected promises', async () => {
      const rejectedPromise = Promise.reject(new Error('Async error'))
      
      await expect(rejectedPromise).rejects.toThrow('Async error')
    })
  })

  describe('Test Utilities', () => {
    test('should have access to Node.js globals', () => {
      expect(global).toBeDefined()
      expect(process).toBeDefined()
      expect(Buffer).toBeDefined()
    })

    test('should be able to use fake timers', () => {
      jest.useFakeTimers()
      
      let callbackCalled = false
      setTimeout(() => {
        callbackCalled = true
      }, 1000)
      
      expect(callbackCalled).toBe(false)
      
      jest.advanceTimersByTime(1000)
      expect(callbackCalled).toBe(true)
      
      jest.useRealTimers()
    })
  })

  describe('Performance Tests', () => {
    test('should measure execution time', () => {
      const start = performance.now()
      
      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.sqrt(i)
      }
      
      const end = performance.now()
      const executionTime = end - start
      
      expect(executionTime).toBeGreaterThan(0)
      expect(executionTime).toBeLessThan(100) // Should be very fast
    })
  })
})