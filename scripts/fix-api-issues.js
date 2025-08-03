#!/usr/bin/env node

/**
 * API Issues Fix Script
 * ES International Department - API 問題修復腳本
 * 
 * This script helps diagnose and fix common API issues found during testing
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

class APIIssueFixer {
  constructor() {
    this.prisma = new PrismaClient();
    this.issues = [];
    this.fixes = [];
  }

  async diagnoseIssues() {
    console.log('🔍 開始診斷 API 問題...\n');

    await this.checkDatabaseConnection();
    await this.checkDatabaseSchema();
    await this.checkAnnouncementsSorting();
    await this.checkEventsTable();
    await this.checkNotificationsTable();
    await this.checkEnvironmentVariables();

    return {
      issues: this.issues,
      fixes: this.fixes
    };
  }

  async checkDatabaseConnection() {
    try {
      await this.prisma.$connect();
      console.log('✅ 資料庫連接正常');
    } catch (error) {
      this.addIssue('DATABASE_CONNECTION', '資料庫連接失敗', error.message);
      this.addFix('DATABASE_CONNECTION', '檢查 DATABASE_URL 環境變數並確保資料庫服務運行');
    }
  }

  async checkDatabaseSchema() {
    try {
      // Check if main tables exist
      const tables = await this.prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      const tableNames = tables.map(t => t.table_name);
      const requiredTables = ['User', 'Announcement', 'Event', 'Notification', 'Role'];
      
      const missingTables = requiredTables.filter(table => 
        !tableNames.includes(table) && !tableNames.includes(table.toLowerCase())
      );
      
      if (missingTables.length > 0) {
        this.addIssue('MISSING_TABLES', `缺少資料表: ${missingTables.join(', ')}`);
        this.addFix('MISSING_TABLES', '執行 npx prisma db push 來創建缺少的資料表');
      } else {
        console.log('✅ 資料庫架構完整');
      }
    } catch (error) {
      this.addIssue('SCHEMA_CHECK', '無法檢查資料庫架構', error.message);
    }
  }

  async checkAnnouncementsSorting() {
    try {
      const announcements = await this.prisma.announcement.findMany({
        orderBy: [
          { priority: 'desc' },
          { publishedAt: 'desc' }
        ],
        take: 5
      });

      if (announcements.length > 1) {
        // Check if sorting is correct
        const priorities = announcements.map(a => a.priority);
        const expectedOrder = ['high', 'medium', 'low'];
        
        let sortingCorrect = true;
        for (let i = 0; i < priorities.length - 1; i++) {
          const currentIndex = expectedOrder.indexOf(priorities[i]);
          const nextIndex = expectedOrder.indexOf(priorities[i + 1]);
          
          if (currentIndex > nextIndex) {
            sortingCorrect = false;
            break;
          }
        }

        if (!sortingCorrect) {
          this.addIssue('ANNOUNCEMENTS_SORTING', '公告排序邏輯不正確');
          this.addFix('ANNOUNCEMENTS_SORTING', '修復公告排序：需要檢查 priority 欄位的資料類型和排序邏輯');
        } else {
          console.log('✅ 公告排序邏輯正確');
        }
      } else {
        console.log('⚠️  公告數量不足，無法驗證排序邏輯');
      }
    } catch (error) {
      this.addIssue('ANNOUNCEMENTS_CHECK', '無法檢查公告排序', error.message);
    }
  }

  async checkEventsTable() {
    try {
      await this.prisma.event.findFirst();
      console.log('✅ Events 資料表存在且可存取');
    } catch (error) {
      this.addIssue('EVENTS_TABLE', 'Events 資料表存取失敗', error.message);
      this.addFix('EVENTS_TABLE', '檢查 Event model 定義並執行 npx prisma db push');
    }
  }

  async checkNotificationsTable() {
    try {
      await this.prisma.notification.findFirst();
      console.log('✅ Notifications 資料表存在且可存取');
    } catch (error) {
      this.addIssue('NOTIFICATIONS_TABLE', 'Notifications 資料表存取失敗', error.message);
      this.addFix('NOTIFICATIONS_TABLE', '檢查 Notification model 定義並執行 npx prisma db push');
    }
  }

  async checkEnvironmentVariables() {
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      this.addIssue('MISSING_ENV_VARS', `缺少環境變數: ${missingVars.join(', ')}`);
      this.addFix('MISSING_ENV_VARS', '檢查 .env.development 檔案並設定缺少的環境變數');
    } else {
      console.log('✅ 必要環境變數已設定');
    }
  }

  addIssue(code, description, details = null) {
    this.issues.push({ code, description, details });
    console.log(`❌ ${description}${details ? `: ${details}` : ''}`);
  }

  addFix(code, solution) {
    this.fixes.push({ code, solution });
    console.log(`🔧 修復建議: ${solution}`);
  }

  async generateFixReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 API 問題診斷報告');
    console.log('='.repeat(60));

    if (this.issues.length === 0) {
      console.log('🎉 沒有發現問題！API 系統狀態良好。');
      return;
    }

    console.log(`\n發現 ${this.issues.length} 個問題：\n`);

    this.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.description}`);
      if (issue.details) {
        console.log(`   詳情: ${issue.details}`);
      }
      
      const fix = this.fixes.find(f => f.code === issue.code);
      if (fix) {
        console.log(`   🔧 修復: ${fix.solution}`);
      }
      console.log();
    });

    // Generate automated fix script
    await this.generateAutoFixScript();
  }

  async generateAutoFixScript() {
    const fixScript = `#!/bin/bash

# API Issues Auto-Fix Script
# ES International Department - API 問題自動修復腳本

echo "🚀 開始修復 API 問題..."

# 1. 資料庫架構更新
echo "📊 更新資料庫架構..."
npx prisma db push

# 2. 重新生成 Prisma 客戶端
echo "🔄 重新生成 Prisma 客戶端..."
npx prisma generate

# 3. 檢查資料庫連接
echo "🔗 測試資料庫連接..."
npm run test:db

# 4. 清理並重建專案
echo "🧹 清理並重建..."
npm run clean
npm install

# 5. 重新啟動開發伺服器
echo "🚀 重新啟動開發伺服器..."
npm run dev

echo "✅ 自動修復完成！請重新執行 API 測試驗證修復結果。"
`;

    const scriptPath = path.join(__dirname, 'auto-fix-api.sh');
    fs.writeFileSync(scriptPath, fixScript);
    fs.chmodSync(scriptPath, '755');
    
    console.log(`📝 自動修復腳本已生成: ${scriptPath}`);
    console.log('執行方式: ./scripts/auto-fix-api.sh');
  }

  async cleanup() {
    await this.prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const fixer = new APIIssueFixer();
  
  try {
    const diagnosis = await fixer.diagnoseIssues();
    await fixer.generateFixReport();
    
    // Save diagnosis to file
    const reportPath = path.join(__dirname, '../api-diagnosis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(diagnosis, null, 2));
    console.log(`\n💾 詳細診斷報告已保存: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ 診斷過程發生錯誤:', error);
  } finally {
    await fixer.cleanup();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { APIIssueFixer };