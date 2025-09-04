#!/usr/bin/env node

/**
 * 簡單測試服務器 - 端口 3002
 * 使用純 Node.js HTTP 模組，無需額外依賴
 */

const http = require('http')
const url = require('url')
const port = 3002

// 路由處理函數
const routes = {
  '/': handleHome,
  '/health': handleHealth,
  '/api/test': handleAPITest,
  '/status': handleStatus
}

// 主頁處理
function handleHome(req, res) {
  const data = {
    message: 'KCISLK ESID Info Hub - 測試服務器',
    port: port,
    status: 'running',
    timestamp: new Date().toISOString(),
    routes: {
      health: '/health',
      api: '/api/test',
      status: '/status'
    }
  }
  sendJSON(res, data)
}

// 健康檢查
function handleHealth(req, res) {
  const data = {
    status: 'healthy',
    port: port,
    uptime: Math.floor(process.uptime()),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  }
  sendJSON(res, data)
}

// API 測試端點
function handleAPITest(req, res) {
  let body = ''
  
  req.on('data', chunk => {
    body += chunk.toString()
  })
  
  req.on('end', () => {
    const data = {
      message: `${req.method} 請求測試成功`,
      method: req.method,
      port: port,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type']
      },
      body: body ? JSON.parse(body) : null,
      timestamp: new Date().toISOString()
    }
    sendJSON(res, data)
  })
}

// 狀態端點
function handleStatus(req, res) {
  const data = {
    server: 'KCISLK ESID Test Server',
    port: port,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    node_version: process.version,
    platform: process.platform,
    pid: process.pid,
    uptime: `${Math.floor(process.uptime())} seconds`,
    timestamp: new Date().toISOString()
  }
  sendJSON(res, data)
}

// 發送 JSON 響應
function sendJSON(res, data) {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  })
  res.end(JSON.stringify(data, null, 2))
}

// 404 處理
function handle404(req, res) {
  res.writeHead(404, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })
  const data = {
    error: 'Not Found',
    message: `路由 ${req.url} 不存在`,
    port: port,
    available_routes: Object.keys(routes),
    timestamp: new Date().toISOString()
  }
  res.end(JSON.stringify(data, null, 2))
}

// 創建服務器
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true)
  const path = parsedUrl.pathname
  
  // CORS 預檢請求處理
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    })
    res.end()
    return
  }
  
  // 路由處理
  if (routes[path]) {
    routes[path](req, res)
  } else {
    handle404(req, res)
  }
})

// 啟動服務器
server.listen(port, () => {
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

// 錯誤處理
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 端口 ${port} 已被占用`)
    process.exit(1)
  } else {
    console.error('❌ 服務器錯誤:', err)
  }
})

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('\n🛑 接收到 SIGTERM 信號，正在關閉服務器...')
  server.close(() => {
    console.log('✅ 服務器已關閉')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('\n🛑 接收到 SIGINT 信號，正在關閉服務器...')
  server.close(() => {
    console.log('✅ 服務器已關閉')
    process.exit(0)
  })
})