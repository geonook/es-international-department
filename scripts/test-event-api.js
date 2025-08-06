/**
 * Event CRUD API Testing Script
 * KCISLK ESID Info Hub Event Management System
 * 
 * This script tests all the event-related API endpoints
 * Run with: node scripts/test-event-api.js
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'
let authToken = null
let testEventId = null
let testRegistrationId = null

// Test utilities
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  })
  
  const data = await response.json()
  
  console.log(`${options.method || 'GET'} ${endpoint}`)
  console.log(`Status: ${response.status}`)
  console.log(`Response:`, JSON.stringify(data, null, 2))
  console.log('---')
  
  return { response, data }
}

async function runTests() {
  console.log('🚀 Starting Event CRUD API Tests...\n')
  
  try {
    // 1. Test authentication (assuming you have a test user)
    console.log('1. Testing Authentication...')
    // Note: You'll need to implement this based on your auth system
    // For now, we'll assume authentication is handled elsewhere
    
    // 2. Test public events listing
    console.log('2. Testing Public Events API...')
    await makeRequest('/api/events?page=1&limit=5&upcoming=true')
    
    // 3. Test events with filters
    console.log('3. Testing Events with Filters...')
    await makeRequest('/api/events?eventType=meeting&targetGrade=3-4')
    
    // 4. Test calendar API
    console.log('4. Testing Calendar API...')
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    await makeRequest(`/api/events/calendar?year=${currentYear}&month=${currentMonth}`)
    
    // 5. Test calendar API (year view)
    console.log('5. Testing Calendar API (Year View)...')
    await makeRequest(`/api/events/calendar?year=${currentYear}`)
    
    // 6. Test single event details (assuming event ID 1 exists)
    console.log('6. Testing Single Event Details...')
    await makeRequest('/api/events/1')
    
    // 7. Test registration status
    console.log('7. Testing Registration Status...')
    await makeRequest('/api/events/1/registration')
    
    // 8. Test event registration (POST)
    console.log('8. Testing Event Registration...')
    const registrationData = {
      participantName: 'Test User',
      participantEmail: 'test@example.com',
      participantPhone: '0912345678',
      grade: '3-4',
      specialRequests: '素食需求'
    }
    await makeRequest('/api/events/1/registration', {
      method: 'POST',
      body: JSON.stringify(registrationData)
    })
    
    // 9. Test admin events listing (requires admin auth)
    console.log('9. Testing Admin Events API...')
    await makeRequest('/api/admin/events?page=1&limit=5')
    
    // 10. Test admin event creation (requires admin auth)
    console.log('10. Testing Admin Event Creation...')
    const eventData = {
      title: 'Test Event',
      description: 'This is a test event created by the API test script',
      eventType: 'meeting',
      startDate: '2025-03-15',
      startTime: '10:00',
      endTime: '12:00',
      location: 'Test Room',
      maxParticipants: 50,
      registrationRequired: true,
      registrationDeadline: '2025-03-12',
      targetGrades: ['3-4', '5-6'],
      status: 'published'
    }
    const createResult = await makeRequest('/api/admin/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    })
    
    if (createResult.data.success) {
      testEventId = createResult.data.data.id
      console.log(`Created test event with ID: ${testEventId}`)
    }
    
    // 11. Test admin event update (if event was created)
    if (testEventId) {
      console.log('11. Testing Admin Event Update...')
      const updateData = {
        ...eventData,
        title: 'Updated Test Event',
        description: 'This event has been updated'
      }
      await makeRequest(`/api/admin/events/${testEventId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })
    }
    
    // 12. Test notifications (requires admin auth)
    if (testEventId) {
      console.log('12. Testing Event Notifications...')
      const notificationData = {
        type: 'reminder',
        recipientType: 'all_registered',
        title: 'Test Notification',
        message: 'This is a test notification sent by the API test script'
      }
      await makeRequest(`/api/events/${testEventId}/notifications`, {
        method: 'POST',
        body: JSON.stringify(notificationData)
      })
      
      // Get notifications list
      await makeRequest(`/api/events/${testEventId}/notifications`)
    }
    
    // 13. Test registration cancellation
    console.log('13. Testing Registration Cancellation...')
    await makeRequest('/api/events/1/registration', {
      method: 'DELETE'
    })
    
    // 14. Cleanup - delete test event (if created)
    if (testEventId) {
      console.log('14. Cleaning up - Deleting Test Event...')
      await makeRequest(`/api/admin/events/${testEventId}`, {
        method: 'DELETE'
      })
    }
    
    console.log('✅ All tests completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Error handling utilities
function handleApiError(error, context) {
  console.error(`Error in ${context}:`, error)
  if (error.response) {
    console.error('Response status:', error.response.status)
    console.error('Response data:', error.response.data)
  }
}

// Validation utilities
function validateEventResponse(event) {
  const requiredFields = ['id', 'title', 'eventType', 'startDate', 'status']
  const missingFields = requiredFields.filter(field => !event.hasOwnProperty(field))
  
  if (missingFields.length > 0) {
    console.warn('Missing required fields:', missingFields)
    return false
  }
  
  return true
}

function validateRegistrationResponse(registration) {
  const requiredFields = ['id', 'eventId', 'userId', 'status']
  const missingFields = requiredFields.filter(field => !registration.hasOwnProperty(field))
  
  if (missingFields.length > 0) {
    console.warn('Missing required fields in registration:', missingFields)
    return false
  }
  
  return true
}

// Performance testing utilities
async function performanceTest() {
  console.log('🚀 Starting Performance Tests...\n')
  
  const startTime = Date.now()
  
  // Test concurrent requests
  const concurrentRequests = Array.from({ length: 10 }, (_, i) => 
    makeRequest('/api/events?page=1&limit=10')
  )
  
  await Promise.all(concurrentRequests)
  
  const endTime = Date.now()
  const duration = endTime - startTime
  
  console.log(`Performance Test Results:`)
  console.log(`- 10 concurrent requests completed in ${duration}ms`)
  console.log(`- Average response time: ${duration / 10}ms`)
  
  if (duration > 5000) {
    console.warn('⚠️ Performance warning: Requests took longer than 5 seconds')
  } else {
    console.log('✅ Performance test passed')
  }
}

// Load testing utilities
async function loadTest() {
  console.log('🚀 Starting Load Tests...\n')
  
  const testSuites = [
    { name: 'Light Load', requests: 5, concurrent: 2 },
    { name: 'Medium Load', requests: 10, concurrent: 5 },
    { name: 'Heavy Load', requests: 20, concurrent: 10 }
  ]
  
  for (const suite of testSuites) {
    console.log(`Testing ${suite.name}: ${suite.requests} requests, ${suite.concurrent} concurrent`)
    const startTime = Date.now()
    
    const batches = []
    for (let i = 0; i < suite.requests; i += suite.concurrent) {
      const batch = Array.from({ length: Math.min(suite.concurrent, suite.requests - i) }, () => 
        makeRequest('/api/events?limit=5')
      )
      batches.push(Promise.all(batch))
    }
    
    await Promise.all(batches)
    
    const endTime = Date.now()
    console.log(`${suite.name} completed in ${endTime - startTime}ms\n`)
  }
}

// Main execution
if (require.main === module) {
  // Check if fetch is available (Node.js 18+)
  if (typeof fetch === 'undefined') {
    console.error('This script requires Node.js 18+ or you need to install node-fetch')
    console.log('Run: npm install node-fetch')
    console.log('Then add: const fetch = require("node-fetch")')
    process.exit(1)
  }
  
  runTests()
    .then(() => {
      if (process.argv.includes('--performance')) {
        return performanceTest()
      }
    })
    .then(() => {
      if (process.argv.includes('--load')) {
        return loadTest()
      }
    })
    .catch(error => {
      console.error('Test suite failed:', error)
      process.exit(1)
    })
}

module.exports = {
  makeRequest,
  validateEventResponse,
  validateRegistrationResponse,
  performanceTest,
  loadTest
}