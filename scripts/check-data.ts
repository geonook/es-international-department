#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('Checking Communication data...');
    
    const totalCount = await prisma.communication.count();
    console.log(`Total Communications: ${totalCount}`);
    
    const byType = await prisma.communication.groupBy({
      by: ['type'],
      _count: { type: true }
    });
    
    console.log('By Type:');
    byType.forEach(item => {
      console.log(`  ${item.type}: ${item._count.type}`);
    });
    
    // Sample records
    const sampleRecords = await prisma.communication.findMany({
      take: 3,
      select: { id: true, title: true, type: true, createdAt: true }
    });
    
    console.log('\nSample Records:');
    sampleRecords.forEach(record => {
      console.log(`  ID: ${record.id}, Type: ${record.type}, Title: ${record.title.substring(0, 50)}...`);
    });
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();