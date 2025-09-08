#!/usr/bin/env tsx

/**
 * Try Staging Password Variants
 * 嘗試 Staging 密碼的各種變體
 */

import { PrismaClient } from '@prisma/client';

async function testPassword(password: string): Promise<boolean> {
  const url = `postgresql://root:${password}@tpe1.clusters.zeabur.com:30592/zeabur`;
  const prisma = new PrismaClient({
    datasources: { db: { url } }
  });
  
  try {
    await prisma.$connect();
    await prisma.$disconnect();
    return true;
  } catch {
    await prisma.$disconnect();
    return false;
  }
}

async function main() {
  console.log('🔍 嘗試 Staging 密碼的各種可能性');
  console.log('=' .repeat(50));
  
  // 基於截圖可能的讀取錯誤
  const passwords = [
    'dA5xMK20jhwiJV39E7GBLyL4Fo6QY18n',  // 原始讀取
    'dA5xMK20jhwiJV39E7GBLyl4Fo6QY18n',  // L vs l
    'dA5xMK20jhwiJV39E7GBlyL4Fo6QY18n',  // ly vs Ly
    'dA5xMK20jhwiJV39E7CBLyL4Fo6QY18n',  // G vs C
    'dA5xMK20jhwiJV39E7GBLyL4F06QY18n',  // o vs 0
    'dA5xMK20jhwiJV39E7GBLyL4F0GQY18n',  // 6 vs G
    'dA5xMK20jhwiJV39E7GBLyL4Fo6QYl8n',  // 1 vs l
    'dA5xMK20jhw1JV39E7GBLyL4Fo6QY18n',  // i vs 1
    // 如果是其他環境的密碼被錯誤分配
    'C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4',   // development
    'p356lGH1k4Kd7zefirJ0YSV8MC29ygON',   // production
  ];
  
  for (const password of passwords) {
    console.log(`\n🔐 測試密碼: ${password}`);
    
    const isValid = await testPassword(password);
    
    if (isValid) {
      console.log('✅ 密碼正確！');
      console.log(`正確的 staging 密碼: ${password}`);
      return password;
    } else {
      console.log('❌ 密碼錯誤');
    }
  }
  
  console.log('\n❌ 所有密碼變體都失敗');
  console.log('可能的原因:');
  console.log('1. 截圖中的密碼包含特殊字符');
  console.log('2. Staging 資料庫可能被暫停或刪除');
  console.log('3. 認證方式可能不同');
  
  return null;
}

if (require.main === module) {
  main().catch(console.error);
}