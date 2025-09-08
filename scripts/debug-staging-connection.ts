#!/usr/bin/env tsx

/**
 * Debug Staging Database Connection
 * 調試 Staging 資料庫連線問題
 */

import { PrismaClient } from '@prisma/client';

async function testStagingConnection() {
  console.log('🔍 測試 Staging 資料庫連線');
  console.log('基本資訊:');
  console.log('  Host: tpe1.clusters.zeabur.com');
  console.log('  Port: 30592');
  console.log('  User: root');
  console.log('  Database: zeabur');
  
  // 嘗試從截圖中看到的密碼
  const passwordsToTry = [
    'dA5xMK20jhwiJV39E7GBLyL4Fo6QY18n',  // 從截圖中看到的
    'C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4',   // development 的密碼
    'p356lGH1k4Kd7zefirJ0YSV8MC29ygON',   // production 的密碼
  ];
  
  for (const password of passwordsToTry) {
    console.log(`\n🔐 嘗試密碼: ${password.substring(0, 8)}...`);
    
    const url = `postgresql://root:${password}@tpe1.clusters.zeabur.com:30592/zeabur`;
    const prisma = new PrismaClient({
      datasources: {
        db: { url }
      }
    });
    
    try {
      await prisma.$connect();
      console.log('✅ 連線成功！');
      
      // 測試基本查詢
      const result = await prisma.$queryRaw`SELECT version()` as any[];
      console.log('📊 資料庫版本:', result[0]?.version?.substring(0, 50) + '...');
      
      await prisma.$disconnect();
      return password;
      
    } catch (error: any) {
      console.log('❌ 連線失敗:', error.message);
      await prisma.$disconnect();
    }
  }
  
  return null;
}

async function main() {
  console.log('🚀 Staging 資料庫連線調試工具');
  console.log('=' .repeat(50));
  
  const workingPassword = await testStagingConnection();
  
  if (workingPassword) {
    console.log('\n🎉 找到正確的密碼！');
    console.log(`正確密碼: ${workingPassword}`);
    console.log('\n請更新 .env.staging 檔案中的 DATABASE_URL');
  } else {
    console.log('\n❌ 所有密碼都無法連線');
    console.log('請檢查:');
    console.log('1. 網路連線狀態');
    console.log('2. Zeabur 資料庫是否正常運行');
    console.log('3. 密碼是否有特殊字符需要編碼');
  }
}

if (require.main === module) {
  main().catch(console.error);
}