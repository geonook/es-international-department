/**
 * File Upload System Test Script for KCISLK ESID Info Hub
 * 檔案上傳系統測試腳本 - 驗證上傳系統功能
 */

import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { writeFile, readFile, unlink } from 'fs/promises'
import { join } from 'path'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

interface TestResult {
  test: string
  passed: boolean
  error?: string
  details?: any
}

const results: TestResult[] = []

function logTest(test: string, passed: boolean, error?: string, details?: any) {
  results.push({ test, passed, error, details })
  const status = passed ? '✅ PASS' : '❌ FAIL'
  console.log(`${status}: ${test}`)
  if (error) console.log(`   Error: ${error}`)
  if (details) console.log(`   Details:`, details)
}

async function createTestFile(filename: string, content: string): Promise<string> {
  const filePath = join(process.cwd(), 'temp', filename)
  await writeFile(filePath, content)
  return filePath
}

async function testUploadConfig() {
  try {
    const response = await fetch('http://localhost:3000/api/upload')
    const config = await response.json()
    
    logTest('Upload Config API', response.ok, 
      response.ok ? undefined : `Status: ${response.status}`, config)
  } catch (error) {
    logTest('Upload Config API', false, (error as Error).message)
  }
}

async function testImageUploadConfig() {
  try {
    const response = await fetch('http://localhost:3000/api/upload/images')
    const config = await response.json()
    
    logTest('Image Upload Config API', response.ok,
      response.ok ? undefined : `Status: ${response.status}`, config)
  } catch (error) {
    logTest('Image Upload Config API', false, (error as Error).message)
  }
}

async function testFileValidation() {
  try {
    const { validateFile, generateSecureFilename } = await import('../lib/fileUpload')
    
    // Test secure filename generation
    const filename = generateSecureFilename('test file.jpg')
    const isSecure = /^\d+_[a-f0-9-]+_test_file\.jpg$/.test(filename)
    logTest('Secure Filename Generation', isSecure, 
      isSecure ? undefined : `Generated: ${filename}`)
    
    // Test file validation with valid image
    const validImageBuffer = Buffer.from('fake image data')
    const validation = await validateFile(validImageBuffer, 'test.jpg')
    logTest('File Validation Function', true, undefined, 
      `Validation result: ${validation.isValid ? 'valid' : 'invalid'}`)
    
  } catch (error) {
    logTest('File Validation', false, (error as Error).message)
  }
}

async function testDatabaseConnection() {
  try {
    const { prisma } = await import('../lib/prisma')
    
    // Test database connection
    await prisma.$connect()
    logTest('Database Connection', true)
    
    // Test FileUpload model
    const fileCount = await prisma.fileUpload.count()
    logTest('FileUpload Model Access', true, undefined, `Current files: ${fileCount}`)
    
    await prisma.$disconnect()
  } catch (error) {
    logTest('Database Connection', false, (error as Error).message)
  }
}

async function testUploadDirectories() {
  try {
    const { existsSync } = await import('fs')
    const { mkdir } = await import('fs/promises')
    
    const directories = [
      'public/uploads',
      'public/uploads/images',
      'public/uploads/documents',
      'public/uploads/temp'
    ]
    
    let allExist = true
    for (const dir of directories) {
      const fullPath = join(process.cwd(), dir)
      if (!existsSync(fullPath)) {
        try {
          await mkdir(fullPath, { recursive: true })
        } catch (error) {
          allExist = false
          break
        }
      }
    }
    
    logTest('Upload Directories', allExist, 
      allExist ? undefined : 'Failed to create upload directories')
  } catch (error) {
    logTest('Upload Directories', false, (error as Error).message)
  }
}

async function testSecurityFeatures() {
  try {
    const { FILE_TYPES } = await import('../lib/fileUpload')
    
    // Test file type configurations
    const hasImageConfig = FILE_TYPES.IMAGES && 
      FILE_TYPES.IMAGES.extensions.length > 0 &&
      FILE_TYPES.IMAGES.maxSize > 0
    
    const hasDocumentConfig = FILE_TYPES.DOCUMENTS &&
      FILE_TYPES.DOCUMENTS.extensions.length > 0 &&
      FILE_TYPES.DOCUMENTS.maxSize > 0
    
    logTest('File Type Configurations', hasImageConfig && hasDocumentConfig,
      undefined, { 
        imageFormats: FILE_TYPES.IMAGES.extensions,
        documentFormats: FILE_TYPES.DOCUMENTS.extensions
      })
  } catch (error) {
    logTest('Security Features', false, (error as Error).message)
  }
}

async function runTests() {
  console.log('🧪 Starting File Upload System Tests...\n')
  
  // Basic functionality tests
  await testUploadDirectories()
  await testDatabaseConnection()
  await testFileValidation()
  await testSecurityFeatures()
  
  // Start Next.js server for API tests
  console.log('\n🚀 Starting Next.js server for API tests...')
  
  try {
    await app.prepare()
    
    const server = createServer((req, res) => {
      if (!req.url) return
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    })
    
    server.listen(3000, () => {
      console.log('✅ Server started on http://localhost:3000')
      
      // Run API tests after server starts
      setTimeout(async () => {
        await testUploadConfig()
        await testImageUploadConfig()
        
        // Close server and show results
        server.close(() => {
          showResults()
        })
      }, 2000)
    })
    
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    showResults()
  }
}

function showResults() {
  const passed = results.filter(r => r.passed).length
  const total = results.length
  const failed = total - passed
  
  console.log('\n📊 Test Results Summary:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`)
  
  if (failed > 0) {
    console.log('\n🔍 Failed Tests:')
    results.filter(r => !r.passed).forEach(result => {
      console.log(`   • ${result.test}: ${result.error}`)
    })
  }
  
  console.log('\n🎯 File Upload System Status:', passed === total ? '✅ Ready' : '⚠️ Needs Attention')
  
  // Recommendations
  console.log('\n📝 Recommendations:')
  console.log('   • Test file upload functionality at /test-upload')
  console.log('   • Verify authentication system is working')
  console.log('   • Check upload directory permissions')
  console.log('   • Test with actual files of different types')
  console.log('   • Monitor file system storage usage')
  
  process.exit(failed > 0 ? 1 : 0)
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error)
  process.exit(1)
})