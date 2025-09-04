#!/usr/bin/env node

/**
 * 修復 Framer Motion 類型錯誤
 * 將 type: "spring" 和 type: "tween" 轉換為字面量類型
 */

import fs from 'fs/promises'
import path from 'path'
import { glob } from 'glob'

interface FixResult {
  file: string
  changes: number
  errors: string[]
}

async function fixFramerMotionTypes(): Promise<void> {
  console.log('🔧 開始修復 Framer Motion 類型錯誤...\n')
  
  const results: FixResult[] = []
  
  try {
    // 查找所有可能包含 Framer Motion 的檔案
    const files = [
      'app/**/*.{ts,tsx}',
      'components/**/*.{ts,tsx}',
      'lib/**/*.{ts,tsx}'
    ]
    
    for (const pattern of files) {
      const matchedFiles = await glob(pattern, {
        ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**']
      })
      
      for (const file of matchedFiles) {
        const result = await fixFileFramerTypes(file)
        if (result.changes > 0 || result.errors.length > 0) {
          results.push(result)
        }
      }
    }
    
    // 生成報告
    generateReport(results)
    
  } catch (error) {
    console.error('❌ 修復過程中發生錯誤:', error)
  }
}

async function fixFileFramerTypes(filePath: string): Promise<FixResult> {
  const result: FixResult = {
    file: filePath,
    changes: 0,
    errors: []
  }
  
  try {
    const content = await fs.readFile(filePath, 'utf8')
    let newContent = content
    let hasChanges = false
    
    // 修復 type: "spring" -> type: "spring" as const
    const springMatches = content.match(/type:\s*["']spring["']/g)
    if (springMatches) {
      newContent = newContent.replace(
        /type:\s*["']spring["']/g,
        'type: "spring" as const'
      )
      result.changes += springMatches.length
      hasChanges = true
    }
    
    // 修復 type: "tween" -> type: "tween" as const
    const tweenMatches = content.match(/type:\s*["']tween["']/g)
    if (tweenMatches) {
      newContent = newContent.replace(
        /type:\s*["']tween["']/g,
        'type: "tween" as const'
      )
      result.changes += tweenMatches.length
      hasChanges = true
    }
    
    // 修復 type: "keyframes" -> type: "keyframes" as const
    const keyframesMatches = content.match(/type:\s*["']keyframes["']/g)
    if (keyframesMatches) {
      newContent = newContent.replace(
        /type:\s*["']keyframes["']/g,
        'type: "keyframes" as const'
      )
      result.changes += keyframesMatches.length
      hasChanges = true
    }
    
    // 修復 type: "inertia" -> type: "inertia" as const
    const inertiaMatches = content.match(/type:\s*["']inertia["']/g)
    if (inertiaMatches) {
      newContent = newContent.replace(
        /type:\s*["']inertia["']/g,
        'type: "inertia" as const'
      )
      result.changes += inertiaMatches.length
      hasChanges = true
    }
    
    // 如果有變更，寫回檔案
    if (hasChanges) {
      await fs.writeFile(filePath, newContent, 'utf8')
      console.log(`✅ 修復: ${filePath} (${result.changes} 個變更)`)
    }
    
  } catch (error) {
    result.errors.push(`處理檔案失敗: ${error}`)
    console.error(`❌ 處理 ${filePath} 時出錯:`, error)
  }
  
  return result
}

function generateReport(results: FixResult[]): void {
  console.log('\n📊 Framer Motion 類型修復報告:')
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
  
  console.log('\n🎯 修復內容:')
  console.log('- type: "spring" → type: "spring" as const')
  console.log('- type: "tween" → type: "tween" as const')
  console.log('- type: "keyframes" → type: "keyframes" as const')
  console.log('- type: "inertia" → type: "inertia" as const')
}

// 執行修復
if (require.main === module) {
  fixFramerMotionTypes()
    .then(() => {
      console.log('\n✅ Framer Motion 類型修復完成!')
      console.log('💡 建議接下來執行: npm run typecheck')
    })
    .catch(error => {
      console.error('❌ 修復失敗:', error)
      process.exit(1)
    })
}

export { fixFramerMotionTypes }