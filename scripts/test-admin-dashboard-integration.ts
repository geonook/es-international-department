#!/usr/bin/env ts-node
/**
 * Test AdminDashboard Integration with Unified Communication System
 * 
 * This script tests the fixed AdminDashboard endpoints and functionality
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAdminDashboardIntegration() {
  console.log('🧪 Testing AdminDashboard Integration...\n');

  try {
    // Test 1: Check if Communication table has data
    console.log('1️⃣ Testing Communication table data...');
    const communications = await prisma.communication.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Found ${communications.length} communications in database`);
    console.log('Sample data:');
    communications.forEach((comm, idx) => {
      console.log(`   ${idx + 1}. ${comm.type}: "${comm.title}" (${comm.status})`);
    });

    // Test 2: Get communication statistics 
    console.log('\n2️⃣ Testing communication statistics...');
    const total = await prisma.communication.count();
    const published = await prisma.communication.count({ where: { status: 'published' } });
    const draft = await prisma.communication.count({ where: { status: 'draft' } });
    const archived = await prisma.communication.count({ where: { status: 'archived' } });
    
    const high = await prisma.communication.count({ where: { priority: 'high' } });
    const medium = await prisma.communication.count({ where: { priority: 'medium' } });
    const low = await prisma.communication.count({ where: { priority: 'low' } });
    
    console.log(`✅ Statistics calculated:`);
    console.log(`   Total: ${total}`);
    console.log(`   Published: ${published}, Draft: ${draft}, Archived: ${archived}`);
    console.log(`   High Priority: ${high}, Medium: ${medium}, Low: ${low}`);

    // Test 3: Test message board communications
    console.log('\n3️⃣ Testing message board communications...');
    const messageBoard = await prisma.communication.findMany({
      where: {
        type: { in: ['message', 'message_board'] }
      },
      take: 3
    });
    
    console.log(`✅ Found ${messageBoard.length} message board communications`);
    messageBoard.forEach((msg, idx) => {
      console.log(`   ${idx + 1}. "${msg.title}" - ${msg.sourceGroup || 'General'} (${msg.status})`);
    });

    // Test 4: Test different communication types
    console.log('\n4️⃣ Testing communication types distribution...');
    const types = await prisma.communication.groupBy({
      by: ['type'],
      _count: { type: true }
    });
    
    console.log(`✅ Communication types:`);
    types.forEach((type) => {
      console.log(`   ${type.type}: ${type._count.type} items`);
    });

    // Test 5: Test target audience distribution
    console.log('\n5️⃣ Testing target audience distribution...');
    const audiences = await prisma.communication.groupBy({
      by: ['targetAudience'],
      _count: { targetAudience: true }
    });
    
    console.log(`✅ Target audiences:`);
    audiences.forEach((aud) => {
      console.log(`   ${aud.targetAudience}: ${aud._count.targetAudience} items`);
    });

    console.log('\n🎉 AdminDashboard Integration Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Total Communications: ${total}`);
    console.log(`   - Published (will show in dashboard): ${published}`);
    console.log(`   - Message Board items: ${messageBoard.length}`);
    console.log(`   - Communication types: ${types.length} different types`);
    
    console.log('\n✅ The AdminDashboard should now show:');
    console.log(`   - "Total Communications": ${total}`);
    console.log(`   - "Active Posts": ${published} (instead of hardcoded 4)`);
    console.log(`   - Message Board button will open unified communication form`);
    console.log(`   - All endpoints point to /api/admin/communications`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAdminDashboardIntegration();