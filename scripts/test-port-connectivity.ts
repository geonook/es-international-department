#!/usr/bin/env tsx

/**
 * Test Database Port Connectivity
 * 測試資料庫端口連通性
 */

import * as net from 'net';

async function testPort(host: string, port: number, timeout: number = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

async function main() {
  console.log('🔍 測試資料庫端口連通性');
  console.log('=' .repeat(40));
  
  const tests = [
    { name: 'Development', host: 'tpe1.clusters.zeabur.com', port: 32718 },
    { name: 'Staging', host: 'tpe1.clusters.zeabur.com', port: 30592 },
    { name: 'Production', host: 'tpe1.clusters.zeabur.com', port: 32312 }
  ];
  
  for (const test of tests) {
    console.log(`\n🔌 測試 ${test.name} (${test.host}:${test.port})`);
    
    const isAccessible = await testPort(test.host, test.port);
    
    if (isAccessible) {
      console.log(`✅ 端口 ${test.port} 可以連通`);
    } else {
      console.log(`❌ 端口 ${test.port} 無法連通`);
    }
  }
  
  console.log('\n' + '=' .repeat(40));
}

if (require.main === module) {
  main().catch(console.error);
}