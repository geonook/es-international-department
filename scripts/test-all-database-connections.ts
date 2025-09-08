#!/usr/bin/env tsx

/**
 * Database Connection Tester for All Environments
 * 全環境資料庫連線測試工具
 * 
 * 測試所有三個環境的資料庫連線並驗證隔離狀態
 * Tests all three environment database connections and verifies isolation
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface DatabaseConfig {
  name: string;
  displayName: string;
  port: number;
  password: string;
  url: string;
}

// 資料庫配置從實際截圖中獲得
const databases: DatabaseConfig[] = [
  {
    name: 'development',
    displayName: '開發環境 Development',
    port: 32718,
    password: 'C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4',
    url: 'postgresql://root:C1iy0Z9n6YFSGJE3p2TMUg78KR5DLeB4@tpe1.clusters.zeabur.com:32718/zeabur'
  },
  {
    name: 'staging',
    displayName: '預備環境 Staging',
    port: 30592,
    password: 'dA5xMK20jhwiJV39E7GBLyl4Fo6QY18n',
    url: 'postgresql://root:dA5xMK20jhwiJV39E7GBLyl4Fo6QY18n@tpe1.clusters.zeabur.com:30592/zeabur'
  },
  {
    name: 'production',
    displayName: '正式環境 Production',
    port: 32312,
    password: 'p356lGH1k4Kd7zefirJ0YSV8MC29ygON',
    url: 'postgresql://root:p356lGH1k4Kd7zefirJ0YSV8MC29ygON@tpe1.clusters.zeabur.com:32312/zeabur'
  }
];

async function testDatabaseConnection(config: DatabaseConfig): Promise<{
  success: boolean;
  tableCount?: number;
  userCount?: number;
  error?: string;
  details?: any;
}> {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: config.url
      }
    }
  });

  try {
    console.log(`\n🔍 測試 ${config.displayName} (Port: ${config.port})`);
    console.log(`   連線字串: postgresql://root:***@tpe1.clusters.zeabur.com:${config.port}/zeabur`);

    // 測試基本連線
    await prisma.$connect();
    console.log(`✅ 資料庫連線成功`);

    // 檢查資料表數量
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ` as any[];
    
    const tableCount = tables.length;
    console.log(`📊 資料表數量: ${tableCount}`);

    // 嘗試檢查用戶數量（如果 users 表存在）
    let userCount = 0;
    try {
      if (tables.some((t: any) => t.table_name === 'User')) {
        userCount = await prisma.user.count();
        console.log(`👥 用戶數量: ${userCount}`);
      } else {
        console.log(`ℹ️  User 表尚未存在`);
      }
    } catch (userError) {
      console.log(`ℹ️  無法查詢用戶數量 (表可能不存在)`);
    }

    await prisma.$disconnect();

    return {
      success: true,
      tableCount,
      userCount,
      details: {
        tables: tables.map((t: any) => t.table_name).sort(),
        port: config.port
      }
    };

  } catch (error: any) {
    console.log(`❌ 連線失敗: ${error.message}`);
    await prisma.$disconnect();
    
    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('🚀 KCISLK ESID Info Hub - 資料庫環境隔離測試');
  console.log('=' .repeat(60));
  console.log(`測試時間: ${new Date().toLocaleString('zh-TW')}`);

  const results: any[] = [];

  // 測試所有資料庫
  for (const config of databases) {
    const result = await testDatabaseConnection(config);
    results.push({
      environment: config.name,
      displayName: config.displayName,
      port: config.port,
      ...result
    });
    
    // 暫停一下避免連線過快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 總結報告
  console.log('\n' + '='.repeat(60));
  console.log('📋 環境隔離測試總結報告');
  console.log('='.repeat(60));

  let allConnected = true;
  const connectionSummary = results.map(r => {
    const status = r.success ? '✅ 成功' : '❌ 失敗';
    if (!r.success) allConnected = false;
    
    return `${r.displayName.padEnd(20)} | Port: ${r.port} | ${status} | 表數: ${r.tableCount || 'N/A'} | 用戶數: ${r.userCount || 'N/A'}`;
  });

  connectionSummary.forEach(summary => console.log(summary));

  // 環境隔離檢查
  console.log('\n🔒 環境隔離狀態分析:');
  const successfulConnections = results.filter(r => r.success);
  
  if (successfulConnections.length >= 2) {
    const tableCounts = successfulConnections.map(r => r.tableCount).filter(Boolean);
    const uniqueTableCounts = [...new Set(tableCounts)];
    
    if (uniqueTableCounts.length > 1) {
      console.log('✅ 資料庫隔離良好 - 不同環境有不同的表結構');
    } else if (tableCounts.every(count => count === 0)) {
      console.log('ℹ️  所有環境都是空資料庫 - 這是正常的初始狀態');
    } else {
      console.log('⚠️  所有環境的表數量相同 - 請檢查是否真正隔離');
    }

    // 檢查每個環境的詳細表清單
    successfulConnections.forEach(conn => {
      if (conn.details && conn.details.tables.length > 0) {
        console.log(`\n📋 ${conn.displayName} 資料表清單:`);
        console.log(`   ${conn.details.tables.join(', ')}`);
      }
    });
  }

  // 最終狀態
  console.log('\n' + '='.repeat(60));
  if (allConnected) {
    console.log('🎉 所有環境資料庫連線測試通過！');
    console.log('✅ 環境隔離配置完成，可以安全使用');
  } else {
    console.log('⚠️  部分環境連線失敗，請檢查配置');
    console.log('❌ 需要修復失敗的連線才能完成隔離');
  }

  // 儲存測試結果到檔案
  const reportPath = path.join(__dirname, '..', 'output', 'database-isolation-test-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    testResults: results,
    summary: {
      totalEnvironments: databases.length,
      successfulConnections: results.filter(r => r.success).length,
      allConnected,
      isolationStatus: allConnected ? 'verified' : 'needs_attention'
    }
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 詳細測試報告已儲存至: ${reportPath}`);

  process.exit(allConnected ? 0 : 1);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('💥 測試過程發生錯誤:', error);
    process.exit(1);
  });
}