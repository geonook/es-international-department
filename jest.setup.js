// Jest DOM matchers
import '@testing-library/jest-dom'

// Global test environment setup
import { TextEncoder, TextDecoder } from 'util'

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js router
const useRouter = jest.fn()
useRouter.mockReturnValue({
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
})

jest.mock('next/navigation', () => ({
  useRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  },
}))

// Mock environment variables for tests
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Mock fetch for API tests
global.fetch = jest.fn()

// Mock console methods to reduce test noise
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Setup and cleanup for each test
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks()
  
  // Reset fetch mock
  if (global.fetch && typeof global.fetch.mockClear === 'function') {
    global.fetch.mockClear()
  }
})

afterEach(() => {
  // Cleanup after each test
  jest.restoreAllMocks()
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}))

// Extend Jest matchers with custom utilities
expect.extend({
  toBeValidJWT(received) {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
    const pass = jwtRegex.test(received)
    
    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid JWT`,
        pass: true,
      }
    } else {
      return {
        message: () => `Expected ${received} to be a valid JWT`,
        pass: false,
      }
    }
  },
  
  toHaveValidEmailFormat(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const pass = emailRegex.test(received)
    
    if (pass) {
      return {
        message: () => `Expected ${received} not to have valid email format`,
        pass: true,
      }
    } else {
      return {
        message: () => `Expected ${received} to have valid email format`,
        pass: false,
      }
    }
  }
})