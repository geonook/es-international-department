#!/usr/bin/env tsx

/**
 * 修復 Prisma 導入不一致問題
 * 統一所有檔案使用 @/lib/prisma 而不是創建新的 PrismaClient 實例
 */

import fs from 'fs/promises'
import path from 'path'
import { glob } from 'glob'

interface FixResult {
  file: string
  changes: number
  errors: string[]
}

async function fixPrismaImports(): Promise<void> {
  console.log('🔧 開始修復 Prisma 導入不一致問題...\n')
  
  const results: FixResult[] = []
  
  try {
    // 查找所有 TypeScript 檔案
    const files = await glob('**/*.{ts,tsx}', {
      ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**']
    })
    
    console.log(`📁 找到 ${files.length} 個 TypeScript 檔案`)
    
    for (const file of files) {
      const result = await fixFileImports(file)
      if (result.changes > 0 || result.errors.length > 0) {
        results.push(result)
      }
    }
    
    // 生成報告
    generateReport(results)
    
  } catch (error) {
    console.error('❌ 修復過程中發生錯誤:', error)
  }
}

async function fixFileImports(filePath: string): Promise<FixResult> {
  const result: FixResult = {
    file: filePath,
    changes: 0,
    errors: []
  }
  
  try {
    const content = await fs.readFile(filePath, 'utf8')
    let newContent = content
    
    // 模式 1: 替換 PrismaClient 導入和實例創建
    if (content.includes('import { PrismaClient } from \'@prisma/client\'') && 
        content.includes('new PrismaClient()')) {
      
      // 替換導入
      newContent = newContent.replace(
        /import \{ PrismaClient \} from '@prisma\/client'/g,
        'import { prisma } from \'@/lib/prisma\''
      )
      
      // 移除實例創建
      newContent = newContent.replace(
        /const prisma = new PrismaClient\(\{[^}]*\}\)|const prisma = new PrismaClient\(\)/g,
        ''
      )
      
      // 清理空行
      newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n')
      
      result.changes++
    }
    
    // 模式 2: 只有 PrismaClient 類型導入（保持不變，用於類型定義）
    // 模式 3: 確保正確的 prisma 導入路徑
    if (content.includes('from \'./prisma\'') || content.includes('from \'../lib/prisma\'')) {
      newContent = newContent.replace(
        /from ['"]\.\.?\/.*lib\/prisma['"]/g,
        'from \'@/lib/prisma\''
      )
      result.changes++
    }
    
    // 如果有變更，寫回檔案
    if (newContent !== content) {
      await fs.writeFile(filePath, newContent, 'utf8')
      console.log(`✅ 修復: ${filePath} (${result.changes} 個變更)`)
    }
    
  } catch (error) {
    result.errors.push(`讀取或寫入檔案失敗: ${error}`)
    console.error(`❌ 處理 ${filePath} 時出錯:`, error)
  }
  
  return result
}

function generateReport(results: FixResult[]): void {
  console.log('\n📊 修復報告:')
  console.log('=' * 50)
  
  const fixedFiles = results.filter(r => r.changes > 0)
  const errorFiles = results.filter(r => r.errors.length > 0)
  const totalChanges = results.reduce((sum, r) => sum + r.changes, 0)
  
  console.log(`✅ 成功修復檔案: ${fixedFiles.length}`)
  console.log(`🔄 總計變更: ${totalChanges}`)
  console.log(`❌ 錯誤檔案: ${errorFiles.length}`)
  
  if (fixedFiles.length > 0) {
    console.log('\n修復的檔案:')
    fixedFiles.forEach(file => {
      console.log(`  • ${file.file} (${file.changes} 個變更)`)
    })
  }
  
  if (errorFiles.length > 0) {
    console.log('\n錯誤檔案:')
    errorFiles.forEach(file => {
      console.log(`  • ${file.file}`)
      file.errors.forEach(error => console.log(`    - ${error}`))
    })
  }
  
  console.log('\n🎯 建議後續動作:')
  console.log('1. 執行 npm run typecheck 檢查類型錯誤')
  console.log('2. 執行測試確保功能正常')
  console.log('3. 檢查任何使用 PrismaClient 的腳本是否需要手動調整')
}

// 執行修復
if (require.main === module) {
  fixPrismaImports()
    .then(() => {
      console.log('\n✅ Prisma 導入修復完成!')
    })
    .catch(error => {
      console.error('❌ 修復失敗:', error)
      process.exit(1)
    })
}

export { fixPrismaImports }