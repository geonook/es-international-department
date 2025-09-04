#!/usr/bin/env node

/**
 * 測試服務器 - 端口 3002
 * 簡單的 Express 服務器用於測試和演示
 */

const express = require('express')
const cors = require('cors')
const app = express()
const port = 3002

// 中間件
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// 基本路由
app.get('/', (req, res) => {
  res.json({
    message: 'KCISLK ESID Info Hub - 測試服務器',
    port: port,
    status: 'running',
    timestamp: new Date().toISOString(),
    routes: {
      health: '/health',
      api: '/api/test',
      status: '/status'
    }
  })
})

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    port: port,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  })
})

// API 測試端點
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API 測試端點正常運行',
    method: 'GET',
    port: port,
    query: req.query,
    headers: {
      'user-agent': req.get('user-agent'),
      'content-type': req.get('content-type')
    },
    timestamp: new Date().toISOString()
  })
})

// 狀態端點
app.get('/status', (req, res) => {
  res.json({
    server: 'KCISLK ESID Test Server',
    port: port,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    node_version: process.version,
    platform: process.platform,
    pid: process.pid,
    uptime: `${Math.floor(process.uptime())} seconds`,
    timestamp: new Date().toISOString()
  })
})

// POST 測試端點
app.post('/api/test', (req, res) => {
  res.json({
    message: 'POST 請求測試成功',
    method: 'POST',
    port: port,
    body: req.body,
    timestamp: new Date().toISOString()
  })
})

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack)
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    port: port,
    timestamp: new Date().toISOString()
  })
})

// 404 處理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `路由 ${req.path} 不存在`,
    port: port,
    available_routes: ['/', '/health', '/api/test', '/status'],
    timestamp: new Date().toISOString()
  })
})

// 啟動服務器
app.listen(port, () => {
  console.log(`🚀 測試服務器已啟動`)
  console.log(`📍 地址: http://localhost:${port}`)
  console.log(`⚡ 狀態: 運行中`)
  console.log(`🕒 時間: ${new Date().toLocaleString('zh-TW')}`)
  console.log(`\n📋 可用端點:`)
  console.log(`   • http://localhost:${port}/          - 主頁`)
  console.log(`   • http://localhost:${port}/health    - 健康檢查`)
  console.log(`   • http://localhost:${port}/api/test  - API 測試`)
  console.log(`   • http://localhost:${port}/status    - 服務器狀態`)
  console.log(`\n🔗 主應用: http://localhost:3001`)
  console.log(`🔗 測試服務: http://localhost:3002`)
})

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('\n🛑 接收到 SIGTERM 信號，正在關閉服務器...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('\n🛑 接收到 SIGINT 信號，正在關閉服務器...')
  process.exit(0)
})