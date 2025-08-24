/**
 * 測試主視覺圖片系統
 * Test hero image system functionality
 */

const { spawn } = require('child_process')

async function testSystem() {
  console.log('🚀 Testing Hero Image System...\n')

  const tests = [
    {
      name: 'Public Settings API - Get Hero Image URL',
      command: 'curl',
      args: ['-s', 'http://localhost:3001/api/settings?key=teacher_hero_image_url'],
      expectedContains: 'teacher_hero_image_url'
    },
    {
      name: 'Teachers Page - Load with Dynamic Background',
      command: 'curl',
      args: ['-s', 'http://localhost:3001/teachers'],
      expectedContains: 'ESID TEACHERS'
    },
    {
      name: 'Admin Page - Management Interface',
      command: 'curl',
      args: ['-I', 'http://localhost:3001/admin'],
      expectedContains: '200 OK'
    },
    {
      name: 'Upload Configuration API',
      command: 'curl',
      args: ['-s', 'http://localhost:3001/api/upload'],
      expectedContains: 'supportedTypes'
    }
  ]

  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      console.log(`📝 Testing: ${test.name}`)
      
      const result = await runCommand(test.command, test.args)
      
      if (result.includes(test.expectedContains)) {
        console.log(`✅ PASSED: ${test.name}`)
        passed++
      } else {
        console.log(`❌ FAILED: ${test.name}`)
        console.log(`   Expected to contain: "${test.expectedContains}"`)
        console.log(`   Got: ${result.substring(0, 200)}...`)
        failed++
      }
    } catch (error) {
      console.log(`❌ ERROR: ${test.name} - ${error.message}`)
      failed++
    }
    
    console.log('')
  }

  console.log('📊 Test Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`)

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Hero Image System is working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the system configuration.')
  }
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args)
    let output = ''
    let error = ''

    process.stdout.on('data', (data) => {
      output += data.toString()
    })

    process.stderr.on('data', (data) => {
      error += data.toString()
    })

    process.on('close', (code) => {
      if (code === 0) {
        resolve(output)
      } else {
        reject(new Error(error || `Command failed with code ${code}`))
      }
    })

    // 設置5秒超時
    setTimeout(() => {
      process.kill()
      reject(new Error('Test timeout'))
    }, 5000)
  })
}

// 執行測試
if (require.main === module) {
  testSystem().catch((error) => {
    console.error('Test execution failed:', error)
    process.exit(1)
  })
}

module.exports = testSystem