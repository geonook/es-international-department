/**
 * Database Integrity Fix Script
 * Cleans up orphaned UserSession records that reference non-existent users
 * 
 * This script addresses the production OAuth issues by:
 * 1. Identifying UserSession records with invalid userId references
 * 2. Safely removing orphaned sessions
 * 3. Validating database integrity after cleanup
 * 4. Providing detailed reporting of actions taken
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CleanupResults {
  orphanedSessions: number
  deletedSessions: number
  remainingSessions: number
  errors: string[]
}

/**
 * Find UserSession records that reference non-existent users
 */
async function findOrphanedSessions() {
  console.log('🔍 Scanning for orphaned UserSession records...')
  
  const orphanedSessions = await prisma.$queryRaw<Array<{id: string, user_id: string, session_token: string}>>`
    SELECT us.id, us.user_id, us.session_token
    FROM user_sessions us
    LEFT JOIN users u ON us.user_id = u.id
    WHERE u.id IS NULL
  `
  
  console.log(`📊 Found ${orphanedSessions.length} orphaned UserSession records`)
  
  if (orphanedSessions.length > 0) {
    console.log('📋 Orphaned sessions details:')
    orphanedSessions.forEach((session, index) => {
      console.log(`  ${index + 1}. Session ID: ${session.id}, User ID: ${session.user_id}, Token: ${session.session_token.substring(0, 20)}...`)
    })
  }
  
  return orphanedSessions
}

/**
 * Validate database integrity before cleanup
 */
async function validateBeforeCleanup() {
  console.log('🏥 Validating database integrity before cleanup...')
  
  const totalUsers = await prisma.user.count()
  const totalSessions = await prisma.userSession.count()
  const validSessions = await prisma.$queryRaw<Array<{count: bigint}>>`
    SELECT COUNT(*) as count
    FROM user_sessions us
    INNER JOIN users u ON us.user_id = u.id
  `
  
  const validSessionCount = Number(validSessions[0].count)
  
  console.log(`📊 Database state before cleanup:`)
  console.log(`  - Total users: ${totalUsers}`)
  console.log(`  - Total sessions: ${totalSessions}`)
  console.log(`  - Valid sessions (with existing users): ${validSessionCount}`)
  console.log(`  - Orphaned sessions: ${totalSessions - validSessionCount}`)
  
  return {
    totalUsers,
    totalSessions,
    validSessions: validSessionCount,
    orphanedSessions: totalSessions - validSessionCount
  }
}

/**
 * Clean up orphaned UserSession records
 */
async function cleanupOrphanedSessions(dryRun: boolean = true): Promise<CleanupResults> {
  const results: CleanupResults = {
    orphanedSessions: 0,
    deletedSessions: 0,
    remainingSessions: 0,
    errors: []
  }
  
  try {
    // Find orphaned sessions
    const orphanedSessions = await findOrphanedSessions()
    results.orphanedSessions = orphanedSessions.length
    
    if (orphanedSessions.length === 0) {
      console.log('✅ No orphaned sessions found. Database integrity is good!')
      results.remainingSessions = await prisma.userSession.count()
      return results
    }
    
    if (dryRun) {
      console.log(`🔍 DRY RUN: Would delete ${orphanedSessions.length} orphaned sessions`)
      console.log('📋 Sessions that would be deleted:')
      orphanedSessions.forEach((session, index) => {
        console.log(`  ${index + 1}. ID: ${session.id} | User: ${session.user_id} | Token: ${session.session_token.substring(0, 20)}...`)
      })
    } else {
      console.log(`🗑️  CLEANUP: Deleting ${orphanedSessions.length} orphaned sessions...`)
      
      // Delete orphaned sessions in batches to avoid overwhelming the database
      const batchSize = 10
      let deletedCount = 0
      
      for (let i = 0; i < orphanedSessions.length; i += batchSize) {
        const batch = orphanedSessions.slice(i, i + batchSize)
        const sessionIds = batch.map(s => s.id)
        
        try {
          const deleteResult = await prisma.userSession.deleteMany({
            where: {
              id: {
                in: sessionIds
              }
            }
          })
          
          deletedCount += deleteResult.count
          console.log(`  ✅ Deleted batch ${Math.floor(i/batchSize) + 1}: ${deleteResult.count} sessions`)
          
        } catch (error) {
          const errorMsg = `Failed to delete batch ${Math.floor(i/batchSize) + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
          console.error(`  ❌ ${errorMsg}`)
          results.errors.push(errorMsg)
        }
      }
      
      results.deletedSessions = deletedCount
      console.log(`✅ Cleanup completed: ${deletedCount} orphaned sessions deleted`)
    }
    
    // Get final session count
    results.remainingSessions = await prisma.userSession.count()
    
  } catch (error) {
    const errorMsg = `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error(`❌ ${errorMsg}`)
    results.errors.push(errorMsg)
  }
  
  return results
}

/**
 * Validate database integrity after cleanup
 */
async function validateAfterCleanup() {
  console.log('🏥 Validating database integrity after cleanup...')
  
  const totalUsers = await prisma.user.count()
  const totalSessions = await prisma.userSession.count()
  
  // Check for any remaining orphaned sessions
  const remainingOrphans = await prisma.$queryRaw<Array<{count: bigint}>>`
    SELECT COUNT(*) as count
    FROM user_sessions us
    LEFT JOIN users u ON us.user_id = u.id
    WHERE u.id IS NULL
  `
  
  const orphanCount = Number(remainingOrphans[0].count)
  
  console.log(`📊 Database state after cleanup:`)
  console.log(`  - Total users: ${totalUsers}`)
  console.log(`  - Total sessions: ${totalSessions}`)
  console.log(`  - Remaining orphaned sessions: ${orphanCount}`)
  
  if (orphanCount === 0) {
    console.log('✅ Database integrity verified: No orphaned sessions remain')
    return true
  } else {
    console.log(`⚠️  Warning: ${orphanCount} orphaned sessions still exist`)
    return false
  }
}

/**
 * Test OAuth functionality after cleanup
 */
async function testOAuthFunctionality() {
  console.log('🔐 Testing OAuth functionality...')
  
  try {
    // Test basic user operations that OAuth would perform
    const sampleUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true
      }
    })
    
    if (sampleUser) {
      console.log(`✅ User query successful: Found user ${sampleUser.email}`)
      
      // Test session creation (what OAuth callback does)
      const testSessionId = `test-cleanup-${Date.now()}`
      const testSession = await prisma.userSession.create({
        data: {
          userId: sampleUser.id,
          sessionToken: testSessionId,
          expiresAt: new Date(Date.now() + 60000), // 1 minute
          userAgent: 'cleanup-test',
          ipAddress: '127.0.0.1'
        }
      })
      
      console.log(`✅ Session creation successful: ${testSession.id}`)
      
      // Cleanup test session
      await prisma.userSession.delete({
        where: { id: testSession.id }
      })
      
      console.log('✅ OAuth functionality test passed')
      return true
      
    } else {
      console.log('⚠️  No users found for testing')
      return false
    }
    
  } catch (error) {
    console.error(`❌ OAuth functionality test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return false
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Database Integrity Fix Script')
  console.log('=' .repeat(50))
  
  const args = process.argv.slice(2)
  const isDryRun = !args.includes('--execute')
  const skipValidation = args.includes('--skip-validation')
  
  if (isDryRun) {
    console.log('🔍 Running in DRY RUN mode - no changes will be made')
    console.log('   Use --execute flag to perform actual cleanup')
  } else {
    console.log('⚡ Running in EXECUTE mode - changes will be made!')
  }
  
  console.log('')
  
  try {
    // Step 1: Validate before cleanup
    if (!skipValidation) {
      await validateBeforeCleanup()
      console.log('')
    }
    
    // Step 2: Perform cleanup
    const results = await cleanupOrphanedSessions(isDryRun)
    console.log('')
    
    // Step 3: Validate after cleanup (only if we actually executed)
    if (!isDryRun && !skipValidation) {
      const isValid = await validateAfterCleanup()
      console.log('')
      
      // Step 4: Test OAuth functionality (only if validation passed)
      if (isValid) {
        await testOAuthFunctionality()
      }
    }
    
    // Summary
    console.log('📋 CLEANUP SUMMARY:')
    console.log('=' .repeat(30))
    console.log(`  Orphaned sessions found: ${results.orphanedSessions}`)
    console.log(`  Sessions deleted: ${results.deletedSessions}`)
    console.log(`  Remaining sessions: ${results.remainingSessions}`)
    
    if (results.errors.length > 0) {
      console.log(`  Errors encountered: ${results.errors.length}`)
      results.errors.forEach((error, index) => {
        console.log(`    ${index + 1}. ${error}`)
      })
    } else {
      console.log('  Errors encountered: 0')
    }
    
    if (isDryRun && results.orphanedSessions > 0) {
      console.log('')
      console.log('🔧 To execute the cleanup, run:')
      console.log('   tsx scripts/fix-database-integrity.ts --execute')
    }
    
  } catch (error) {
    console.error('❌ Script execution failed:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Execute the script
if (require.main === module) {
  main()
}

export { cleanupOrphanedSessions, validateBeforeCleanup, validateAfterCleanup, testOAuthFunctionality }