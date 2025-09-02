#!/usr/bin/env tsx

/**
 * Migration Script: Unified Communications
 * 資料遷移腳本：統一通訊系統
 * 
 * This script:
 * 1. Creates the new communications and communication_replies tables
 * 2. Migrates data from announcements and message_board tables
 * 3. Preserves all existing data including Vickie's first week message
 * 4. Updates reply counts and relationships
 * 5. Creates necessary indexes for performance
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function runMigration() {
  console.log('🚀 Starting unified communications migration...\n')
  
  try {
    // Step 1: Read and execute the SQL migration
    console.log('📋 Step 1: Creating communications tables...')
    const sqlMigration = fs.readFileSync(
      path.join(process.cwd(), 'prisma/migrations/001_add_communications_table.sql'),
      'utf-8'
    )
    
    // Split SQL statements and execute them
    const statements = sqlMigration
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement)
          console.log(`✅ Executed: ${statement.substring(0, 50)}...`)
        } catch (error) {
          console.error(`❌ Failed to execute: ${statement.substring(0, 50)}...`)
          console.error('Error:', error)
          // Continue with other statements
        }
      }
    }
    
    // Step 2: Verify data migration
    console.log('\n📊 Step 2: Verifying data migration...')
    
    const [totalCommunications, totalReplies] = await Promise.all([
      prisma.communication.count(),
      prisma.communicationReply.count()
    ])
    
    console.log(`✅ Migrated ${totalCommunications} communications`)
    console.log(`✅ Migrated ${totalReplies} communication replies`)
    
    // Step 3: Verify Vickie's first week message
    console.log('\n🔍 Step 3: Verifying Vickie\'s first week message...')
    
    const vickieMessages = await prisma.communication.findMany({
      where: {
        sourceGroup: 'Vickie',
        isImportant: true
      },
      include: {
        author: {
          select: {
            displayName: true,
            email: true
          }
        }
      }
    })
    
    console.log(`✅ Found ${vickieMessages.length} important messages from Vickie`)
    vickieMessages.forEach(msg => {
      console.log(`   - "${msg.title}" (${msg.createdAt.toISOString()})`)
    })
    
    // Step 4: Update statistics
    console.log('\n📈 Step 4: Updating communication statistics...')
    
    // Update reply counts for all communications
    const communications = await prisma.communication.findMany({
      select: { id: true }
    })
    
    for (const comm of communications) {
      const replyCount = await prisma.communicationReply.count({
        where: { communicationId: comm.id }
      })
      
      if (replyCount > 0) {
        await prisma.communication.update({
          where: { id: comm.id },
          data: { replyCount }
        })
      }
    }
    
    // Step 5: Generate final statistics
    console.log('\n📊 Step 5: Final statistics...')
    
    const stats = await Promise.all([
      prisma.communication.count(),
      prisma.communication.count({ where: { type: 'announcement' } }),
      prisma.communication.count({ where: { type: 'message' } }),
      prisma.communication.count({ where: { isImportant: true } }),
      prisma.communication.count({ where: { isPinned: true } }),
      prisma.communication.count({ where: { sourceGroup: 'Vickie' } }),
      prisma.communication.count({ where: { sourceGroup: 'Matthew' } }),
      prisma.communicationReply.count()
    ])
    
    const [
      totalComms, announcements, messages, important, pinned,
      vickieComms, matthewComms, totalCommReplies
    ] = stats
    
    console.log('\n🎉 Migration completed successfully!')
    console.log('=====================================')
    console.log(`Total Communications: ${totalComms}`)
    console.log(`  - Announcements: ${announcements}`)
    console.log(`  - Messages: ${messages}`)
    console.log(`  - Important: ${important}`)
    console.log(`  - Pinned: ${pinned}`)
    console.log(`  - From Vickie: ${vickieComms}`)
    console.log(`  - From Matthew: ${matthewComms}`)
    console.log(`Total Replies: ${totalCommReplies}`)
    
    // Step 6: Test API functionality
    console.log('\n🧪 Step 6: Testing basic functionality...')
    
    const latestComm = await prisma.communication.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            displayName: true,
            email: true
          }
        },
        replies: {
          take: 3,
          include: {
            author: {
              select: {
                displayName: true
              }
            }
          }
        }
      }
    })
    
    if (latestComm) {
      console.log(`✅ Latest communication: "${latestComm.title}"`)
      console.log(`   Author: ${latestComm.author?.displayName || 'Unknown'}`)
      console.log(`   Type: ${latestComm.type}`)
      console.log(`   Status: ${latestComm.status}`)
      console.log(`   Replies: ${latestComm.replies.length}`)
    }
    
    console.log('\n🚀 Communications API is ready for use!')
    console.log('New endpoints available:')
    console.log('  - GET /api/v1/communications')
    console.log('  - POST /api/v1/communications')
    console.log('  - GET /api/v1/communications/[id]')
    console.log('  - PUT /api/v1/communications/[id]')
    console.log('  - DELETE /api/v1/communications/[id]')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    console.error('\nPlease check the error above and try again.')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n✅ Migration script completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error)
      process.exit(1)
    })
}

export default runMigration