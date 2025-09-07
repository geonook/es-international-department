/**
 * Database Access Diagnostic Endpoint
 * Tests specific table access and permissions
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET() {
  const diagnosticResults = {
    timestamp: new Date().toISOString(),
    tests: [] as Array<{
      test: string
      status: 'pass' | 'fail'
      message: string
      error?: string
    }>
  }

  // Test 1: Basic database connection
  try {
    await prisma.$connect()
    diagnosticResults.tests.push({
      test: 'Database Connection',
      status: 'pass',
      message: 'Successfully connected to database'
    })
  } catch (error) {
    diagnosticResults.tests.push({
      test: 'Database Connection',
      status: 'fail',
      message: 'Failed to connect to database',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 2: UserSession table read access
  try {
    const sessionCount = await prisma.userSession.count()
    diagnosticResults.tests.push({
      test: 'UserSession Table Read',
      status: 'pass',
      message: `Successfully read UserSession table. Count: ${sessionCount}`
    })
  } catch (error) {
    diagnosticResults.tests.push({
      test: 'UserSession Table Read',
      status: 'fail',
      message: 'Failed to read UserSession table',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 3: UserSession table write access
  const testSessionId = `test-${Date.now()}`
  const testUserId = 'test-user-diagnostic'
  
  try {
    // First, check if we can create a test session
    const testSession = await prisma.userSession.create({
      data: {
        userId: testUserId,
        sessionToken: testSessionId,
        expiresAt: new Date(Date.now() + 60000), // 1 minute from now
        userAgent: 'diagnostic-test',
        ipAddress: '127.0.0.1'
      }
    })
    
    diagnosticResults.tests.push({
      test: 'UserSession Table Write',
      status: 'pass',
      message: `Successfully created test session: ${testSession.id}`
    })

    // Clean up: delete the test session
    await prisma.userSession.delete({
      where: { id: testSession.id }
    })
    
    diagnosticResults.tests.push({
      test: 'UserSession Table Delete',
      status: 'pass',
      message: 'Successfully deleted test session'
    })

  } catch (error) {
    diagnosticResults.tests.push({
      test: 'UserSession Table Write',
      status: 'fail',
      message: 'Failed to write to UserSession table',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 4: User table access (for foreign key validation)
  try {
    const userCount = await prisma.user.count()
    diagnosticResults.tests.push({
      test: 'User Table Access',
      status: 'pass',
      message: `Successfully accessed User table. Count: ${userCount}`
    })
  } catch (error) {
    diagnosticResults.tests.push({
      test: 'User Table Access',
      status: 'fail',
      message: 'Failed to access User table',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 5: Check if we have any actual users for session creation
  try {
    const firstUser = await prisma.user.findFirst({
      select: { id: true, email: true }
    })
    
    if (firstUser) {
      diagnosticResults.tests.push({
        test: 'Real User Availability',
        status: 'pass',
        message: `Found real user for testing: ${firstUser.email}`
      })

      // Test 6: Try creating a session for a real user
      try {
        const realSessionId = `real-test-${Date.now()}`
        const realSession = await prisma.userSession.create({
          data: {
            userId: firstUser.id,
            sessionToken: realSessionId,
            expiresAt: new Date(Date.now() + 60000),
            userAgent: 'diagnostic-real-user-test',
            ipAddress: '127.0.0.1'
          }
        })

        diagnosticResults.tests.push({
          test: 'Real User Session Creation',
          status: 'pass',
          message: `Successfully created session for real user: ${realSession.id}`
        })

        // Clean up
        await prisma.userSession.delete({
          where: { id: realSession.id }
        })

      } catch (error) {
        diagnosticResults.tests.push({
          test: 'Real User Session Creation',
          status: 'fail',
          message: 'Failed to create session for real user',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
      
    } else {
      diagnosticResults.tests.push({
        test: 'Real User Availability',
        status: 'fail',
        message: 'No users found in database'
      })
    }
  } catch (error) {
    diagnosticResults.tests.push({
      test: 'Real User Availability',
      status: 'fail',
      message: 'Failed to query users',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Summary
  const passedTests = diagnosticResults.tests.filter(t => t.status === 'pass').length
  const totalTests = diagnosticResults.tests.length
  const allPassed = passedTests === totalTests

  return NextResponse.json({
    success: allPassed,
    summary: `${passedTests}/${totalTests} tests passed`,
    diagnostics: diagnosticResults,
    recommendation: allPassed 
      ? 'All database tests passed. The issue may be elsewhere.'
      : 'Database access issues detected. Check failed tests for details.'
  })
}

// Only allow GET for security
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}