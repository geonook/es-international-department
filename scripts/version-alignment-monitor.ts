#!/usr/bin/env tsx

/**
 * Version Alignment Monitor | 版本對齊監控系統
 * 
 * 自動化監控三個環境的版本對齊狀態，生成詳細報告並提供警報
 * Automated monitoring for version alignment across three environments
 * 
 * @author Claude Code
 * @version 1.0.0
 * @date 2025-09-07
 */

import { readFileSync } from 'fs'
import { writeFileSync } from 'fs'
import path from 'path'

interface EnvironmentStatus {
  name: string
  url: string
  version: string
  status: string
  responseTime: number
  databaseStatus: string
  oauthStatus: 'working' | 'failed' | 'not_tested'
  lastChecked: string
  issues: string[]
}

interface VersionAlignmentReport {
  timestamp: string
  overallStatus: 'aligned' | 'misaligned' | 'critical'
  targetVersion: string
  environments: EnvironmentStatus[]
  summary: {
    aligned: number
    misaligned: number
    critical: number
  }
  recommendations: string[]
}

class VersionAlignmentMonitor {
  private readonly ENVIRONMENTS = [
    {
      name: 'Development',
      url: 'http://localhost:3001',
      description: '本地開發環境'
    },
    {
      name: 'Staging', 
      url: 'https://next14-landing.zeabur.app',
      description: '預備測試環境'
    },
    {
      name: 'Production',
      url: 'https://kcislk-infohub.zeabur.app', 
      description: '正式生產環境'
    }
  ]

  private targetVersion: string = '1.6.0'

  constructor() {
    this.loadTargetVersion()
    console.log('🔍 版本對齊監控系統啟動 | Version Alignment Monitor Started')
    console.log(`🎯 目標版本: v${this.targetVersion}`)
  }

  private loadTargetVersion() {
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
      this.targetVersion = packageJson.version
    } catch (error) {
      console.warn('⚠️ 無法讀取package.json，使用預設版本1.6.0')
    }
  }

  private async checkEnvironmentHealth(env: typeof this.ENVIRONMENTS[0]): Promise<EnvironmentStatus> {
    const startTime = Date.now()
    const status: EnvironmentStatus = {
      name: env.name,
      url: env.url,
      version: 'unknown',
      status: 'unknown',
      responseTime: 0,
      databaseStatus: 'unknown',
      oauthStatus: 'not_tested',
      lastChecked: new Date().toISOString(),
      issues: []
    }

    try {
      // 測試主要健康端點
      const healthResponse = await fetch(`${env.url}/api/health`, {
        timeout: 10000
      })
      
      status.responseTime = Date.now() - startTime

      if (!healthResponse.ok) {
        status.issues.push(`HTTP ${healthResponse.status} 錯誤`)
        status.status = 'unhealthy'
        return status
      }

      const healthData = await healthResponse.json()
      
      // 解析健康數據
      status.version = healthData.version || 'unknown'
      status.status = healthData.status || 'unknown'
      status.databaseStatus = healthData.performance?.database?.status || 'unknown'

      // 版本對齊檢查
      if (status.version !== this.targetVersion) {
        status.issues.push(`版本不對齊: ${status.version} ≠ ${this.targetVersion}`)
      }

      // 資料庫健康檢查
      if (status.databaseStatus !== 'healthy') {
        status.issues.push(`資料庫狀態異常: ${status.databaseStatus}`)
      }

      // OAuth端點檢查 (除了本地環境)
      if (env.name !== 'Development') {
        try {
          const oauthResponse = await fetch(`${env.url}/api/auth/providers`, {
            timeout: 5000
          })
          
          if (oauthResponse.ok) {
            const oauthData = await oauthResponse.json()
            if (oauthData.google) {
              status.oauthStatus = 'working'
            } else {
              status.oauthStatus = 'failed'
              status.issues.push('OAuth配置不完整')
            }
          } else {
            status.oauthStatus = 'failed'
            status.issues.push(`OAuth端點錯誤: ${oauthResponse.status}`)
          }
        } catch (oauthError) {
          status.oauthStatus = 'failed'
          status.issues.push('OAuth端點無法訪問')
        }
      }

    } catch (error) {
      status.issues.push(`連接失敗: ${error instanceof Error ? error.message : 'Unknown error'}`)
      status.status = 'unreachable'
    }

    return status
  }

  private async generateReport(): Promise<VersionAlignmentReport> {
    console.log('📊 正在檢查所有環境...')
    
    const environments: EnvironmentStatus[] = []
    
    for (const env of this.ENVIRONMENTS) {
      console.log(`   🔍 檢查 ${env.name} (${env.url})...`)
      const status = await this.checkEnvironmentHealth(env)
      environments.push(status)
      
      const statusIcon = status.status === 'OK' ? '✅' : status.status === 'unreachable' ? '🔴' : '⚠️'
      console.log(`   ${statusIcon} ${env.name}: v${status.version} (${status.status})`)
    }

    // 計算總體狀態
    const aligned = environments.filter(env => env.version === this.targetVersion).length
    const misaligned = environments.filter(env => 
      env.version !== this.targetVersion && env.version !== 'unknown'
    ).length
    const critical = environments.filter(env => 
      env.status === 'unreachable' || env.issues.length > 2
    ).length

    let overallStatus: 'aligned' | 'misaligned' | 'critical' = 'aligned'
    if (critical > 0) {
      overallStatus = 'critical'
    } else if (misaligned > 0) {
      overallStatus = 'misaligned'
    }

    // 生成建議
    const recommendations: string[] = []
    
    if (overallStatus === 'critical') {
      recommendations.push('🔴 緊急: 存在環境連接問題，需要立即檢查')
    }
    
    if (misaligned > 0) {
      recommendations.push(`⚠️ ${misaligned}個環境版本不對齊，建議更新至v${this.targetVersion}`)
    }

    environments.forEach(env => {
      if (env.oauthStatus === 'failed') {
        recommendations.push(`🔐 ${env.name}環境OAuth配置需要修復`)
      }
      if (env.databaseStatus !== 'healthy' && env.databaseStatus !== 'unknown') {
        recommendations.push(`💾 ${env.name}環境資料庫連接需要檢查`)
      }
    })

    if (recommendations.length === 0) {
      recommendations.push('✅ 所有環境狀態良好，版本對齊')
    }

    const report: VersionAlignmentReport = {
      timestamp: new Date().toISOString(),
      overallStatus,
      targetVersion: this.targetVersion,
      environments,
      summary: {
        aligned,
        misaligned,
        critical
      },
      recommendations
    }

    return report
  }

  private generateMarkdownReport(report: VersionAlignmentReport): string {
    const timestamp = new Date(report.timestamp).toLocaleString('zh-TW', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })

    let markdown = `# 版本對齊監控報告 | Version Alignment Monitor Report

> **生成時間**: ${timestamp} UTC+8  
> **目標版本**: v${report.targetVersion}  
> **整體狀態**: ${this.getStatusIcon(report.overallStatus)} ${report.overallStatus.toUpperCase()}  
> **檢查環境**: ${report.environments.length}個

## 📊 環境狀態總覽

| 環境 | 版本 | 狀態 | 響應時間 | 資料庫 | OAuth | 問題數 |
|------|------|------|----------|--------|-------|--------|
`

    report.environments.forEach(env => {
      const statusIcon = env.status === 'OK' ? '✅' : env.status === 'unreachable' ? '🔴' : '⚠️'
      const versionIcon = env.version === report.targetVersion ? '✅' : '❌'
      const dbIcon = env.databaseStatus === 'healthy' ? '✅' : env.databaseStatus === 'unknown' ? '❓' : '❌'
      const oauthIcon = env.oauthStatus === 'working' ? '✅' : env.oauthStatus === 'failed' ? '❌' : '❓'
      
      markdown += `| **${env.name}** | ${versionIcon} v${env.version} | ${statusIcon} ${env.status} | ${env.responseTime}ms | ${dbIcon} ${env.databaseStatus} | ${oauthIcon} ${env.oauthStatus} | ${env.issues.length} |\n`
    })

    markdown += `

## 📈 統計摘要

- **✅ 版本對齊**: ${report.summary.aligned}/${report.environments.length} 個環境
- **⚠️ 版本不對齊**: ${report.summary.misaligned} 個環境  
- **🔴 嚴重問題**: ${report.summary.critical} 個環境

## 🚨 發現的問題

`
    report.environments.forEach(env => {
      if (env.issues.length > 0) {
        markdown += `### ${env.name} 環境\n`
        env.issues.forEach(issue => {
          markdown += `- ❌ ${issue}\n`
        })
        markdown += '\n'
      }
    })

    if (report.environments.every(env => env.issues.length === 0)) {
      markdown += '✅ 未發現任何問題\n\n'
    }

    markdown += `## 💡 建議行動

`
    report.recommendations.forEach(rec => {
      markdown += `- ${rec}\n`
    })

    markdown += `

## 📝 詳細環境資訊

`
    report.environments.forEach(env => {
      markdown += `### ${env.name}\n`
      markdown += `- **URL**: ${env.url}\n`
      markdown += `- **版本**: v${env.version}\n`
      markdown += `- **狀態**: ${env.status}\n`
      markdown += `- **響應時間**: ${env.responseTime}ms\n`
      markdown += `- **資料庫**: ${env.databaseStatus}\n`
      markdown += `- **OAuth**: ${env.oauthStatus}\n`
      markdown += `- **最後檢查**: ${new Date(env.lastChecked).toLocaleString('zh-TW', {timeZone: 'Asia/Taipei'})}\n`
      
      if (env.issues.length > 0) {
        markdown += `- **問題**: ${env.issues.join(', ')}\n`
      }
      markdown += '\n'
    })

    markdown += `---
*自動生成報告 | Generated by Version Alignment Monitor*  
*下次檢查將在下個監控週期執行*
`

    return markdown
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'aligned': return '✅'
      case 'misaligned': return '⚠️'
      case 'critical': return '🔴'
      default: return '❓'
    }
  }

  private saveReport(report: VersionAlignmentReport, markdown: string) {
    const timestamp = new Date().toISOString().split('T')[0]
    
    // 保存JSON報告
    const jsonPath = path.join('output', `version-alignment-${timestamp}.json`)
    writeFileSync(jsonPath, JSON.stringify(report, null, 2))
    
    // 保存Markdown報告
    const mdPath = path.join('docs', `VERSION-ALIGNMENT-MONITOR-${timestamp}.md`)
    writeFileSync(mdPath, markdown)
    
    console.log(`📄 報告已保存:`)
    console.log(`   JSON: ${jsonPath}`)
    console.log(`   Markdown: ${mdPath}`)
  }

  async runCheck() {
    try {
      const report = await this.generateReport()
      const markdown = this.generateMarkdownReport(report)
      
      // 輸出簡短摘要到控制台
      console.log('\\n📊 檢查完成摘要:')
      console.log(`   整體狀態: ${this.getStatusIcon(report.overallStatus)} ${report.overallStatus.toUpperCase()}`)
      console.log(`   版本對齊: ${report.summary.aligned}/${report.environments.length}`)
      console.log(`   問題環境: ${report.summary.misaligned + report.summary.critical}`)
      
      if (report.overallStatus !== 'aligned') {
        console.log('\\n💡 主要建議:')
        report.recommendations.slice(0, 3).forEach(rec => {
          console.log(`   ${rec}`)
        })
      }

      // 保存詳細報告
      this.saveReport(report, markdown)
      
      return report
      
    } catch (error) {
      console.error('❌ 監控檢查失敗:', error)
      throw error
    }
  }

  async startContinuousMonitoring(intervalMinutes: number = 30) {
    console.log(`🔄 開始持續監控 (間隔: ${intervalMinutes}分鐘)`)
    console.log('   按 Ctrl+C 停止監控\\n')
    
    // 立即執行一次檢查
    await this.runCheck()
    
    // 設置定時檢查
    const interval = setInterval(async () => {
      console.log('\\n🔄 執行定期版本對齊檢查...')
      try {
        await this.runCheck()
      } catch (error) {
        console.error('❌ 定期檢查失敗:', error)
      }
    }, intervalMinutes * 60 * 1000)
    
    // 優雅關閉處理
    process.on('SIGINT', () => {
      console.log('\\n🛑 收到停止信號，正在關閉監控...')
      clearInterval(interval)
      process.exit(0)
    })
  }
}

// 主程式邏輯
async function main() {
  const args = process.argv.slice(2)
  const monitor = new VersionAlignmentMonitor()
  
  if (args.includes('--continuous') || args.includes('-c')) {
    const intervalArg = args.find(arg => arg.startsWith('--interval='))
    const interval = intervalArg ? parseInt(intervalArg.split('=')[1]) : 30
    
    await monitor.startContinuousMonitoring(interval)
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
版本對齊監控系統 | Version Alignment Monitor

使用方式:
  npm run monitor:version              # 執行單次檢查
  npm run monitor:version -- -c        # 持續監控 (30分鐘間隔)
  npm run monitor:version -- -c --interval=15  # 持續監控 (15分鐘間隔)
  
選項:
  -c, --continuous              啟動持續監控模式
  --interval=<minutes>         設定監控間隔 (分鐘，預設30)
  -h, --help                   顯示此幫助資訊

輸出:
  - 控制台顯示檢查摘要
  - JSON報告保存到 output/ 目錄
  - Markdown報告保存到 docs/ 目錄
`)
  } else {
    // 預設執行單次檢查
    await monitor.runCheck()
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ 程式執行失敗:', error)
    process.exit(1)
  })
}

export { VersionAlignmentMonitor, type VersionAlignmentReport, type EnvironmentStatus }