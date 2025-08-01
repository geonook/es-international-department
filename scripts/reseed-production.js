#!/usr/bin/env node

/**
 * Production Database Re-seeding Script
 * 生產環境資料庫重新種子腳本
 * 
 * This script safely re-seeds the production database with basic data
 * while preserving existing data where possible.
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🌱 Starting production database re-seeding...\n');

// Set NODE_ENV to production to match deployment environment
process.env.NODE_ENV = 'production';

// Get the full path to the seed script
const seedScript = path.join(__dirname, '../prisma/seed.ts');

// Run the seed script
const command = `npx tsx "${seedScript}"`;

console.log(`📄 Executing: ${command}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
console.log(`📁 Database URL: ${process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌'}\n`);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error executing seed script:', error);
    process.exit(1);
  }

  if (stderr) {
    console.error('⚠️  Seed script stderr:', stderr);
  }

  console.log('📤 Seed script output:');
  console.log(stdout);
  
  console.log('\n🎉 Production re-seeding completed!');
  console.log('🔄 You may need to restart the Zeabur deployment to see changes.');
});